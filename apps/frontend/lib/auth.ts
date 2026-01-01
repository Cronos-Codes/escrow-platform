import { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./db";

// Providers
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import GitlabProvider from "next-auth/providers/gitlab";
// import EmailProvider from "next-auth/providers/email"; // Disabled for development
import CredentialsProvider from "next-auth/providers/credentials";

// Firebase integration
import { auth, db } from "@escrow/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserRole } from "@escrow/auth";

export const authOptions: NextAuthOptions = {
  // Only use MongoDB adapter if we have a proper connection
  // For development, we'll rely on Firebase for authentication
  ...(process.env.MONGODB_URL && process.env.DB_NAME ? {
    adapter: MongoDBAdapter(clientPromise, {
      collections: {
        Accounts: "nextauth_accounts",
        Sessions: "nextauth_sessions", 
        Users: "nextauth_users",
        VerificationTokens: "nextauth_verificationTokens",
      },
      databaseName: process.env.DB_NAME || "escrow_auth",
    })
  } : {}),
  
  providers: [
    // Email/Password provider using Firebase
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Use Firebase for email/password authentication
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );

          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
              id: userCredential.user.uid,
              email: userCredential.user.email,
              name: userData.displayName,
              role: userData.role,
              kycStatus: userData.kycStatus,
            };
          }

          return null;
        } catch (error) {
          console.error("Firebase auth error:", error);
          return null;
        }
      }
    }),

    // OAuth Providers
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    
    GitlabProvider({
      clientId: process.env.GITLAB_CLIENT_ID!,
      clientSecret: process.env.GITLAB_CLIENT_SECRET!,
    }),
    
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // EmailProvider disabled for development - requires nodemailer
    // EmailProvider({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST,
    //     port: parseInt(process.env.EMAIL_SERVER_PORT || "465"),
    //     auth: {
    //       user: process.env.EMAIL_SERVER_USER,
    //       pass: process.env.EMAIL_SERVER_PASSWORD,
    //     },
    //   },
    //   from: process.env.EMAIL_FROM,
    // }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers, create/update user in Firestore
      if (account?.provider !== "credentials") {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.id));
          
          if (!userDoc.exists()) {
            // Create new user document
            const newUser = {
              uid: user.id,
              email: user.email,
              displayName: user.name,
              role: UserRole.BUYER, // Default role
              kycStatus: 'pending',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              provider: account?.provider,
            };
            
            await setDoc(doc(db, 'users', user.id), newUser);
          } else {
            // Update existing user
            await setDoc(doc(db, 'users', user.id), {
              updatedAt: Date.now(),
              email: user.email,
              displayName: user.name,
            }, { merge: true });
          }
        } catch (error) {
          console.error("Error syncing user to Firestore:", error);
        }
      }
      
      return true;
    },

    async session({ session, token }) {
      if (token.sub) {
        // Get user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', token.sub));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            session.user = {
              ...session.user,
              id: token.sub,
              role: userData.role,
              kycStatus: userData.kycStatus,
            };
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.kycStatus = user.kycStatus;
      }
      return token;
    },
  },

  pages: {
    signIn: '/auth',
    error: '/auth/error',
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET || "development-secret-key-change-in-production",
};
