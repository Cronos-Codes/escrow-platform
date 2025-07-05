#!/bin/bash

# Phase 7.4 - Feature Flag Management Script
# Manages feature flags and environment variables for rollout

set -e

# Configuration
LAUNCHDARKLY_SDK_KEY=${LAUNCHDARKLY_SDK_KEY:-""}
LAUNCHDARKLY_API_KEY=${LAUNCHDARKLY_API_KEY:-""}
ENVIRONMENT=${1:-production}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check LaunchDarkly configuration
check_launchdarkly() {
    if [ -z "$LAUNCHDARKLY_SDK_KEY" ]; then
        print_warning "LAUNCHDARKLY_SDK_KEY not set, skipping LaunchDarkly operations"
        return 1
    fi
    
    if [ -z "$LAUNCHDARKLY_API_KEY" ]; then
        print_warning "LAUNCHDARKLY_API_KEY not set, some operations may fail"
        return 1
    fi
    
    return 0
}

# Function to create feature flags
create_feature_flags() {
    print_info "Creating feature flags..."
    
    if ! check_launchdarkly; then
        return
    fi
    
    # Industry adapters flags
    curl -X POST "https://app.launchdarkly.com/api/v2/flags/$PROJECT_KEY" \
        -H "Authorization: $LAUNCHDARKLY_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "real-estate-adapter",
            "key": "real-estate-adapter",
            "description": "Enable real estate tokenization adapter",
            "variations": [
                {"value": true, "name": "Enabled"},
                {"value": false, "name": "Disabled"}
            ],
            "defaults": {
                "onVariation": 0,
                "offVariation": 1
            },
            "temporary": false
        }'
    
    curl -X POST "https://app.launchdarkly.com/api/v2/flags/$PROJECT_KEY" \
        -H "Authorization: $LAUNCHDARKLY_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "precious-metals-adapter",
            "key": "precious-metals-adapter",
            "description": "Enable precious metals assay adapter",
            "variations": [
                {"value": true, "name": "Enabled"},
                {"value": false, "name": "Disabled"}
            ],
            "defaults": {
                "onVariation": 0,
                "offVariation": 1
            },
            "temporary": false
        }'
    
    curl -X POST "https://app.launchdarkly.com/api/v2/flags/$PROJECT_KEY" \
        -H "Authorization: $LAUNCHDARKLY_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "oil-gas-adapter",
            "key": "oil-gas-adapter",
            "description": "Enable oil and gas shipment adapter",
            "variations": [
                {"value": true, "name": "Enabled"},
                {"value": false, "name": "Disabled"}
            ],
            "defaults": {
                "onVariation": 0,
                "offVariation": 1
            },
            "temporary": false
        }'
    
    # Paymaster flags
    curl -X POST "https://app.launchdarkly.com/api/v2/flags/$PROJECT_KEY" \
        -H "Authorization: $LAUNCHDARKLY_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "gasless-transactions",
            "key": "gasless-transactions",
            "description": "Enable gasless transactions via paymaster",
            "variations": [
                {"value": true, "name": "Enabled"},
                {"value": false, "name": "Disabled"}
            ],
            "defaults": {
                "onVariation": 0,
                "offVariation": 1
            },
            "temporary": false
        }'
    
    # AI features
    curl -X POST "https://app.launchdarkly.com/api/v2/flags/$PROJECT_KEY" \
        -H "Authorization: $LAUNCHDARKLY_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "ai-dispute-triage",
            "key": "ai-dispute-triage",
            "description": "Enable AI-powered dispute triage",
            "variations": [
                {"value": true, "name": "Enabled"},
                {"value": false, "name": "Disabled"}
            ],
            "defaults": {
                "onVariation": 0,
                "offVariation": 1
            },
            "temporary": false
        }'
    
    print_status "Feature flags created successfully"
}

# Function to configure flag targeting
configure_flag_targeting() {
    print_info "Configuring flag targeting..."
    
    if ! check_launchdarkly; then
        return
    fi
    
    # Enable real estate adapter for 10% of users
    curl -X PATCH "https://app.launchdarkly.com/api/v2/flags/$PROJECT_KEY/real-estate-adapter" \
        -H "Authorization: $LAUNCHDARKLY_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "instructions": [
                {
                    "kind": "updateDefaultVariationOrRollout",
                    "defaultVariationOrRollout": {
                        "rollout": {
                            "variations": [
                                {"variation": 0, "weight": 10000},
                                {"variation": 1, "weight": 90000}
                            ]
                        }
                    }
                }
            ]
        }'
    
    # Enable gasless transactions for all users
    curl -X PATCH "https://app.launchdarkly.com/api/v2/flags/$PROJECT_KEY/gasless-transactions" \
        -H "Authorization: $LAUNCHDARKLY_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "instructions": [
                {
                    "kind": "updateDefaultVariationOrRollout",
                    "defaultVariationOrRollout": {
                        "variation": 0
                    }
                }
            ]
        }'
    
    print_status "Flag targeting configured"
}

# Function to upload environment variables
upload_environment_variables() {
    print_info "Uploading environment variables..."
    
    # Firebase Functions config
    firebase functions:config:set \
        launchdarkly.sdk_key="$LAUNCHDARKLY_SDK_KEY" \
        escrow.network="$NETWORK" \
        escrow.contract_address="$ESCROW_CONTRACT_ADDRESS" \
        escrow.paymaster_address="$PAYMASTER_CONTRACT_ADDRESS" \
        escrow.arbitrator_address="$ARBITRATOR_CONTRACT_ADDRESS" \
        --project $FIREBASE_PROJECT_ID
    
    # Vercel environment variables
    if command -v vercel &> /dev/null; then
        vercel env add LAUNCHDARKLY_SDK_KEY production
        vercel env add ESCROW_CONTRACT_ADDRESS production
        vercel env add PAYMASTER_CONTRACT_ADDRESS production
        vercel env add ARBITRATOR_CONTRACT_ADDRESS production
    fi
    
    print_status "Environment variables uploaded"
}

# Function to create rollout plan
create_rollout_plan() {
    print_info "Creating rollout plan..."
    
    cat > artifacts/rollout-plan.md << EOF
# Feature Rollout Plan

## Phase 1: Foundation (Week 1)
- [x] Core escrow functionality
- [x] Basic authentication
- [x] Smart contract deployment

## Phase 2: Enhanced Features (Week 2)
- [ ] Real estate adapter (10% rollout)
- [ ] Gasless transactions (100% rollout)
- [ ] AI dispute triage (50% rollout)

## Phase 3: Industry Expansion (Week 3)
- [ ] Precious metals adapter (25% rollout)
- [ ] Oil & gas adapter (25% rollout)
- [ ] Advanced analytics (100% rollout)

## Phase 4: Optimization (Week 4)
- [ ] Performance optimizations
- [ ] UX improvements
- [ ] Security enhancements

## Rollback Procedures
1. **Immediate Rollback:** Disable feature flag
2. **Database Rollback:** Restore from backup
3. **Contract Rollback:** Deploy previous version
4. **Frontend Rollback:** Deploy previous version

## Monitoring Metrics
- Error rates
- Performance metrics
- User engagement
- Transaction volume
- Support tickets

## Success Criteria
- Error rate < 1%
- Response time < 200ms
- User satisfaction > 4.5/5
- Transaction success rate > 99%

Generated: $(date)
EOF
    
    print_status "Rollout plan created"
}

# Function to monitor flag usage
monitor_flag_usage() {
    print_info "Monitoring flag usage..."
    
    if ! check_launchdarkly; then
        return
    fi
    
    # Get flag usage metrics
    curl -X GET "https://app.launchdarkly.com/api/v2/metrics/$PROJECT_KEY" \
        -H "Authorization: $LAUNCHDARKLY_API_KEY" \
        -o artifacts/flag-metrics.json
    
    print_status "Flag usage metrics exported"
}

# Function to toggle flags
toggle_flag() {
    local flag_key=$1
    local variation=$2
    
    print_info "Toggling flag: $flag_key to variation: $variation"
    
    if ! check_launchdarkly; then
        return
    fi
    
    curl -X PATCH "https://app.launchdarkly.com/api/v2/flags/$PROJECT_KEY/$flag_key" \
        -H "Authorization: $LAUNCHDARKLY_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"instructions\": [
                {
                    \"kind\": \"updateDefaultVariationOrRollout\",
                    \"defaultVariationOrRollout\": {
                        \"variation\": $variation
                    }
                }
            ]
        }"
    
    print_status "Flag $flag_key toggled successfully"
}

# Function to list all flags
list_flags() {
    print_info "Listing all feature flags..."
    
    if ! check_launchdarkly; then
        return
    fi
    
    curl -X GET "https://app.launchdarkly.com/api/v2/flags/$PROJECT_KEY" \
        -H "Authorization: $LAUNCHDARKLY_API_KEY" \
        -o artifacts/flags-list.json
    
    print_status "Flags list exported to artifacts/flags-list.json"
}

# Main function
main() {
    case "${1:-help}" in
        "create")
            create_feature_flags
            ;;
        "configure")
            configure_flag_targeting
            ;;
        "upload-env")
            upload_environment_variables
            ;;
        "rollout-plan")
            create_rollout_plan
            ;;
        "monitor")
            monitor_flag_usage
            ;;
        "toggle")
            if [ -z "$2" ] || [ -z "$3" ]; then
                print_error "Usage: $0 toggle <flag-key> <variation>"
                exit 1
            fi
            toggle_flag "$2" "$3"
            ;;
        "list")
            list_flags
            ;;
        "all")
            create_feature_flags
            configure_flag_targeting
            upload_environment_variables
            create_rollout_plan
            ;;
        "help"|*)
            echo "Usage: $0 <command> [args]"
            echo ""
            echo "Commands:"
            echo "  create          Create feature flags"
            echo "  configure       Configure flag targeting"
            echo "  upload-env      Upload environment variables"
            echo "  rollout-plan    Create rollout plan"
            echo "  monitor         Monitor flag usage"
            echo "  toggle <key> <var> Toggle specific flag"
            echo "  list            List all flags"
            echo "  all             Run all operations"
            echo "  help            Show this help"
            ;;
    esac
}

# Run main function
main "$@" 