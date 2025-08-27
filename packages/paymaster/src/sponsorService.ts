import { z } from 'zod';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@escrow/auth';

// ============ Zod Schemas ============

const SponsorProfileSchema = z.object({
  name: z.string().min(1, 'Sponsor name is required'),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  maxDailySpend: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount format'),
  email: z.string().email('Invalid email address').optional(),
  company: z.string().optional(),
  kycVerified: z.boolean().default(false),
  termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
  createdAt: z.number().optional()
});

const DepositSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount format'),
  transactionHash: z.string().optional(),
  timestamp: z.number().optional()
});

const WhitelistUserSchema = z.object({
  sponsorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid sponsor address'),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid user address'),
  reason: z.string().optional(),
  trustScore: z.number().min(0).max(100).optional()
});

// ============ Types ============

export interface SponsorProfile {
  name: string;
  address: string;
  maxDailySpend: string;
  email?: string;
  company?: string;
  kycVerified: boolean;
  termsAccepted: boolean;
  createdAt?: number;
}

export interface Sponsor extends SponsorProfile {
  id: string;
  balance: string;
  whitelistedUsers: string[];
  totalSpent: string;
  dailySpent: string;
  lastResetTime: number;
  isActive: boolean;
  metadata: {
    totalTransactions: number;
    averageGasCost: string;
    lastActivity: number;
    riskScore: number;
  };
}

export interface GasAnalytics {
  daily: {
    date: string;
    gasCost: string;
    transactions: number;
    uniqueUsers: number;
  }[];
  weekly: {
    week: string;
    gasCost: string;
    transactions: number;
    uniqueUsers: number;
  }[];
  monthly: {
    month: string;
    gasCost: string;
    transactions: number;
    uniqueUsers: number;
  }[];
}

export interface WhitelistEntry {
  userAddress: string;
  addedAt: number;
  addedBy: string;
  reason?: string;
  trustScore?: number;
  lastUsed?: number;
  totalGasUsed: string;
}

// ============ Sponsor Service Class ============

export class SponsorService {
  private readonly sponsorsCollection = 'sponsors';
  private readonly analyticsCollection = 'sponsor_analytics';
  private readonly whitelistCollection = 'whitelist_entries';

  /**
   * Creates a new sponsor
   * @param profile Sponsor profile data
   * @returns Created sponsor object
   */
  async createSponsor(profile: SponsorProfile): Promise<Sponsor> {
    try {
      // Validate input
      const validatedProfile = SponsorProfileSchema.parse(profile);
      
      // Check if sponsor already exists
      const existingSponsor = await this.getSponsorByAddress(validatedProfile.address);
      if (existingSponsor) {
        throw new Error('Sponsor already exists');
      }

      const now = Date.now();
      const sponsorData: Sponsor = {
        ...validatedProfile,
        id: validatedProfile.address,
        balance: '0',
        whitelistedUsers: [],
        totalSpent: '0',
        dailySpent: '0',
        lastResetTime: now,
        isActive: true,
        createdAt: now,
        metadata: {
          totalTransactions: 0,
          averageGasCost: '0',
          lastActivity: now,
          riskScore: 0
        }
      };

      // Save to Firestore
      await setDoc(doc(db, this.sponsorsCollection, sponsorData.id), {
        ...sponsorData,
        createdAt: Timestamp.fromMillis(now),
        lastResetTime: Timestamp.fromMillis(now),
        lastActivity: Timestamp.fromMillis(now)
      });

      // Initialize analytics
      await this.initializeAnalytics(sponsorData.id);

      return sponsorData;
    } catch (error) {
      console.error('Error creating sponsor:', error);
      throw new Error(`Failed to create sponsor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deposits funds to a sponsor
   * @param sponsorAddress Sponsor's address
   * @param amount Amount to deposit
   * @param transactionHash Optional transaction hash
   * @returns Updated sponsor balance
   */
  async depositFunds(sponsorAddress: string, amount: string, transactionHash?: string): Promise<string> {
    try {
      // Validate input
      const validatedDeposit = DepositSchema.parse({ amount, transactionHash });
      
      const sponsor = await this.getSponsorByAddress(sponsorAddress);
      if (!sponsor) {
        throw new Error('Sponsor not found');
      }

      if (!sponsor.isActive) {
        throw new Error('Sponsor is not active');
      }

      const currentBalance = parseFloat(sponsor.balance);
      const depositAmount = parseFloat(validatedDeposit.amount);
      const newBalance = (currentBalance + depositAmount).toString();

      // Update sponsor balance
      await updateDoc(doc(db, this.sponsorsCollection, sponsorAddress), {
        balance: newBalance,
        lastActivity: Timestamp.fromMillis(Date.now())
      });

      // Log deposit transaction
      await this.logTransaction(sponsorAddress, {
        type: 'deposit',
        amount: validatedDeposit.amount,
        transactionHash: validatedDeposit.transactionHash,
        timestamp: Date.now()
      });

      return newBalance;
    } catch (error) {
      console.error('Error depositing funds:', error);
      throw new Error(`Failed to deposit funds: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Whitelists a user for a sponsor
   * @param sponsorAddress Sponsor's address
   * @param userAddress User's address
   * @param reason Optional reason for whitelisting
   * @param trustScore Optional trust score (0-100)
   * @returns Updated whitelist
   */
  async whitelistUser(
    sponsorAddress: string, 
    userAddress: string, 
    reason?: string, 
    trustScore?: number
  ): Promise<string[]> {
    try {
      // Validate input
      const validatedData = WhitelistUserSchema.parse({
        sponsorAddress,
        userAddress,
        reason,
        trustScore
      });

      const sponsor = await this.getSponsorByAddress(validatedData.sponsorAddress);
      if (!sponsor) {
        throw new Error('Sponsor not found');
      }

      if (!sponsor.isActive) {
        throw new Error('Sponsor is not active');
      }

      if (sponsor.whitelistedUsers.includes(validatedData.userAddress)) {
        throw new Error('User already whitelisted');
      }

      const now = Date.now();
      const updatedWhitelist = [...sponsor.whitelistedUsers, validatedData.userAddress];

      // Update sponsor whitelist
      await updateDoc(doc(db, this.sponsorsCollection, sponsorAddress), {
        whitelistedUsers: updatedWhitelist,
        lastActivity: Timestamp.fromMillis(now)
      });

      // Create whitelist entry
      const whitelistEntry: WhitelistEntry = {
        userAddress: validatedData.userAddress,
        addedAt: now,
        addedBy: 'system', // TODO: Get from auth context
        reason: validatedData.reason,
        trustScore: validatedData.trustScore,
        totalGasUsed: '0'
      };

      await setDoc(
        doc(db, this.sponsorsCollection, sponsorAddress, this.whitelistCollection, validatedData.userAddress),
        {
          ...whitelistEntry,
          addedAt: Timestamp.fromMillis(now)
        }
      );

      return updatedWhitelist;
    } catch (error) {
      console.error('Error whitelisting user:', error);
      throw new Error(`Failed to whitelist user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Removes a user from sponsor's whitelist
   * @param sponsorAddress Sponsor's address
   * @param userAddress User's address
   * @returns Updated whitelist
   */
  async removeWhitelistedUser(sponsorAddress: string, userAddress: string): Promise<string[]> {
    try {
      const sponsor = await this.getSponsorByAddress(sponsorAddress);
      if (!sponsor) {
        throw new Error('Sponsor not found');
      }

      if (!sponsor.whitelistedUsers.includes(userAddress)) {
        throw new Error('User not whitelisted');
      }

      const updatedWhitelist = sponsor.whitelistedUsers.filter(addr => addr !== userAddress);

      // Update sponsor whitelist
      await updateDoc(doc(db, this.sponsorsCollection, sponsorAddress), {
        whitelistedUsers: updatedWhitelist,
        lastActivity: Timestamp.fromMillis(Date.now())
      });

      // Remove whitelist entry
      await deleteDoc(
        doc(db, this.sponsorsCollection, sponsorAddress, this.whitelistCollection, userAddress)
      );

      return updatedWhitelist;
    } catch (error) {
      console.error('Error removing whitelisted user:', error);
      throw new Error(`Failed to remove whitelisted user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets sponsor status and analytics
   * @param sponsorAddress Sponsor's address
   * @returns Sponsor status with analytics
   */
  async getSponsorStatus(sponsorAddress: string): Promise<Sponsor & { analytics: GasAnalytics }> {
    try {
      const sponsor = await this.getSponsorByAddress(sponsorAddress);
      if (!sponsor) {
        throw new Error('Sponsor not found');
      }

      const analytics = await this.getAnalytics(sponsorAddress);
      
      return {
        ...sponsor,
        analytics
      };
    } catch (error) {
      console.error('Error getting sponsor status:', error);
      throw new Error(`Failed to get sponsor status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Removes a sponsor and archives their data
   * @param sponsorAddress Sponsor's address
   * @returns Success status
   */
  async removeSponsor(sponsorAddress: string): Promise<boolean> {
    try {
      const sponsor = await this.getSponsorByAddress(sponsorAddress);
      if (!sponsor) {
        throw new Error('Sponsor not found');
      }

      // Archive sponsor data before deletion
      await this.archiveSponsorData(sponsor);

      // Mark sponsor as inactive
      await updateDoc(doc(db, this.sponsorsCollection, sponsorAddress), {
        isActive: false,
        lastActivity: Timestamp.fromMillis(Date.now())
      });

      return true;
    } catch (error) {
      console.error('Error removing sponsor:', error);
      throw new Error(`Failed to remove sponsor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates gas usage analytics for a sponsor
   * @param sponsorAddress Sponsor's address
   * @param gasCost Gas cost in wei
   * @param userAddress User's address
   */
  async updateGasUsage(sponsorAddress: string, gasCost: string, userAddress: string): Promise<void> {
    try {
      const sponsor = await this.getSponsorByAddress(sponsorAddress);
      if (!sponsor) {
        throw new Error('Sponsor not found');
      }

      const now = Date.now();
      const gasCostNum = parseFloat(gasCost);
      const currentTotalSpent = parseFloat(sponsor.totalSpent);
      const currentDailySpent = parseFloat(sponsor.dailySpent);

      // Check if daily limit should reset
      let newDailySpent = currentDailySpent;
      let lastResetTime = sponsor.lastResetTime;
      
      if (now >= sponsor.lastResetTime + 24 * 60 * 60 * 1000) {
        newDailySpent = gasCostNum;
        lastResetTime = now;
      } else {
        newDailySpent += gasCostNum;
      }

      // Update sponsor data
      const newTotalSpent = (currentTotalSpent + gasCostNum).toString();
      const newAverageGasCost = sponsor.metadata.totalTransactions > 0 
        ? (parseFloat(newTotalSpent) / (sponsor.metadata.totalTransactions + 1)).toString()
        : gasCost;

      await updateDoc(doc(db, this.sponsorsCollection, sponsorAddress), {
        totalSpent: newTotalSpent,
        dailySpent: newDailySpent.toString(),
        lastResetTime: Timestamp.fromMillis(lastResetTime),
        lastActivity: Timestamp.fromMillis(now),
        'metadata.totalTransactions': sponsor.metadata.totalTransactions + 1,
        'metadata.averageGasCost': newAverageGasCost,
        'metadata.lastActivity': now
      });

      // Update whitelist entry
      await this.updateWhitelistEntry(sponsorAddress, userAddress, gasCost);

      // Update analytics
      await this.updateAnalytics(sponsorAddress, gasCost, userAddress, now);
    } catch (error) {
      console.error('Error updating gas usage:', error);
      throw new Error(`Failed to update gas usage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets all sponsors with optional filtering
   * @param filters Optional filters
   * @returns Array of sponsors
   */
  async getAllSponsors(filters?: {
    isActive?: boolean;
    minBalance?: string;
    maxBalance?: string;
  }): Promise<Sponsor[]> {
    try {
      let q = query(collection(db, this.sponsorsCollection));
      
      if (filters?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      const snapshot = await getDocs(q);
      const sponsors: Sponsor[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        sponsors.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          lastResetTime: data.lastResetTime?.toMillis() || Date.now(),
          lastActivity: data.lastActivity?.toMillis() || Date.now()
        } as Sponsor);
      });

      // Apply additional filters
      let filteredSponsors = sponsors;
      
      if (filters?.minBalance) {
        filteredSponsors = filteredSponsors.filter(s => 
          parseFloat(s.balance) >= parseFloat(filters.minBalance!)
        );
      }

      if (filters?.maxBalance) {
        filteredSponsors = filteredSponsors.filter(s => 
          parseFloat(s.balance) <= parseFloat(filters.maxBalance!)
        );
      }

      return filteredSponsors;
    } catch (error) {
      console.error('Error getting all sponsors:', error);
      throw new Error(`Failed to get sponsors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============ Private Helper Methods ============

  private async getSponsorByAddress(address: string): Promise<Sponsor | null> {
    try {
      const docRef = doc(db, this.sponsorsCollection, address);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          lastResetTime: data.lastResetTime?.toMillis() || Date.now(),
          lastActivity: data.lastActivity?.toMillis() || Date.now()
        } as Sponsor;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting sponsor by address:', error);
      return null;
    }
  }

  private async initializeAnalytics(sponsorAddress: string): Promise<void> {
    const analytics: GasAnalytics = {
      daily: [],
      weekly: [],
      monthly: []
    };

    await setDoc(doc(db, this.analyticsCollection, sponsorAddress), analytics);
  }

  private async getAnalytics(sponsorAddress: string): Promise<GasAnalytics> {
    try {
      const docRef = doc(db, this.analyticsCollection, sponsorAddress);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as GasAnalytics;
      }
      
      return { daily: [], weekly: [], monthly: [] };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return { daily: [], weekly: [], monthly: [] };
    }
  }

  private async updateAnalytics(
    sponsorAddress: string, 
    gasCost: string, 
    userAddress: string, 
    timestamp: number
  ): Promise<void> {
    try {
      const analytics = await this.getAnalytics(sponsorAddress);
      const date = new Date(timestamp);
      const dateStr = date.toISOString().split('T')[0];
      const weekStr = this.getWeekString(date);
      const monthStr = date.toISOString().substring(0, 7);

      // Update daily analytics
      const dailyIndex = analytics.daily.findIndex(d => d.date === dateStr);
      if (dailyIndex >= 0) {
        analytics.daily[dailyIndex].gasCost = (
          parseFloat(analytics.daily[dailyIndex].gasCost) + parseFloat(gasCost)
        ).toString();
        analytics.daily[dailyIndex].transactions += 1;
        if (!analytics.daily[dailyIndex].uniqueUsers.includes(userAddress)) {
          analytics.daily[dailyIndex].uniqueUsers.push(userAddress);
        }
      } else {
        analytics.daily.push({
          date: dateStr,
          gasCost,
          transactions: 1,
          uniqueUsers: [userAddress]
        });
      }

      // Update weekly analytics
      const weeklyIndex = analytics.weekly.findIndex(w => w.week === weekStr);
      if (weeklyIndex >= 0) {
        analytics.weekly[weeklyIndex].gasCost = (
          parseFloat(analytics.weekly[weeklyIndex].gasCost) + parseFloat(gasCost)
        ).toString();
        analytics.weekly[weeklyIndex].transactions += 1;
        if (!analytics.weekly[weeklyIndex].uniqueUsers.includes(userAddress)) {
          analytics.weekly[weeklyIndex].uniqueUsers.push(userAddress);
        }
      } else {
        analytics.weekly.push({
          week: weekStr,
          gasCost,
          transactions: 1,
          uniqueUsers: [userAddress]
        });
      }

      // Update monthly analytics
      const monthlyIndex = analytics.monthly.findIndex(m => m.month === monthStr);
      if (monthlyIndex >= 0) {
        analytics.monthly[monthlyIndex].gasCost = (
          parseFloat(analytics.monthly[monthlyIndex].gasCost) + parseFloat(gasCost)
        ).toString();
        analytics.monthly[monthlyIndex].transactions += 1;
        if (!analytics.monthly[monthlyIndex].uniqueUsers.includes(userAddress)) {
          analytics.monthly[monthlyIndex].uniqueUsers.push(userAddress);
        }
      } else {
        analytics.monthly.push({
          month: monthStr,
          gasCost,
          transactions: 1,
          uniqueUsers: [userAddress]
        });
      }

      await setDoc(doc(db, this.analyticsCollection, sponsorAddress), analytics);
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  }

  private async updateWhitelistEntry(sponsorAddress: string, userAddress: string, gasCost: string): Promise<void> {
    try {
      const entryRef = doc(db, this.sponsorsCollection, sponsorAddress, this.whitelistCollection, userAddress);
      const entrySnap = await getDoc(entryRef);
      
      if (entrySnap.exists()) {
        const data = entrySnap.data();
        const currentTotal = parseFloat(data.totalGasUsed || '0');
        const newTotal = (currentTotal + parseFloat(gasCost)).toString();
        
        await updateDoc(entryRef, {
          totalGasUsed: newTotal,
          lastUsed: Timestamp.fromMillis(Date.now())
        });
      }
    } catch (error) {
      console.error('Error updating whitelist entry:', error);
    }
  }

  private async logTransaction(sponsorAddress: string, transaction: {
    type: string;
    amount: string;
    transactionHash?: string;
    timestamp: number;
  }): Promise<void> {
    try {
      await setDoc(
        doc(db, this.sponsorsCollection, sponsorAddress, 'transactions', `${transaction.timestamp}`),
        {
          ...transaction,
          timestamp: Timestamp.fromMillis(transaction.timestamp)
        }
      );
    } catch (error) {
      console.error('Error logging transaction:', error);
    }
  }

  private async archiveSponsorData(sponsor: Sponsor): Promise<void> {
    try {
      const archiveData = {
        ...sponsor,
        archivedAt: Timestamp.fromMillis(Date.now()),
        archivedBy: 'system' // TODO: Get from auth context
      };

      await setDoc(
        doc(db, 'archived_sponsors', sponsor.address),
        archiveData
      );
    } catch (error) {
      console.error('Error archiving sponsor data:', error);
    }
  }

  private getWeekString(date: Date): string {
    const year = date.getFullYear();
    const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }
}

// ============ Export Singleton Instance ============

export const sponsorService = new SponsorService(); 