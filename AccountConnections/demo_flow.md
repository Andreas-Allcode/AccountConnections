# LinkedIn Scraping Demo Flow

## 🎯 **What We Built**

A home page company search that demonstrates the value of Account Connections by showing users exactly who they can reach through their LinkedIn network.

## 🚀 **User Experience Flow**

### **Step 1: Home Page Search (Logged Out)**
1. User visits the home page
2. Sees: "Who has connections at..."
3. Enters a company name (e.g., "Google", "Microsoft", "AllCode")
4. Clicks "Find My Connections"

### **Step 2: Results Display**
- Shows "🎯 150 People You Can Reach at [Company]"
- Lists employees with:
  - Name (hidden if logged out: "J*** S****")
  - Title and company
  - Location
  - **"X LinkedIn connections at [Company]"** (key value prop)
  - 1st degree connection badge
  - Message/View Profile buttons

### **Step 3: Value Demonstration**
- User sees they can reach 150+ people at the target company
- Realizes the power of their LinkedIn network
- Wants to connect but buttons prompt: "Sign in to connect with people"

### **Step 4: Conversion**
- User clicks sign up/sign in to access the connections
- Gets full names and active connection capabilities

## 🎨 **Key Features Implemented**

✅ **Home page company search**  
✅ **Mock data showing 150 1st degree connections**  
✅ **Priority ordering by connection count at target company**  
✅ **Hidden names for logged-out users**  
✅ **Clear value proposition messaging**  
✅ **Sign-in prompts for actions**  
✅ **Realistic employee data with titles and locations**

## 📊 **Mock Data Characteristics**

- Generates up to 150 employees per company search
- All are simulated as 1st degree connections
- Each person has 1-15 connections at the target company
- Results prioritized by number of connections at target company
- 5% chance of verified account manager badge
- Realistic names, titles, and locations

## 🔧 **Technical Implementation**

- **Frontend**: Landing page with company search
- **Backend**: Convex action that generates realistic mock data
- **Components**: LinkedInResults component with logged-in/out states
- **Integration**: Works with existing OAuth flow

## 🎪 **Demo Script**

1. **Open home page** - Show clean company search interface
2. **Search "AllCode"** - Demonstrate finding connections
3. **Show results** - Point out hidden names and connection counts
4. **Try to connect** - Show sign-in prompt
5. **Explain value** - "See how many people you can reach!"

The system perfectly demonstrates the core value proposition: users can discover and reach people at any company through their existing LinkedIn network.