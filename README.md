# PULSE — Intelligent Social Community Platform

> **TAGLINE:** *"Share. Connect. Discover. Grow."*

PULSE is a full-stack social media platform engineered for meaningful intellectual interaction, high-value content discovery, and positive digital community building rather than superficial like aggregation.

---

## 🌟 Key Highlights & Unique Features

Unlike traditional social media applications, PULSE introduces unique mechanics designed to foster thoughtful engagement:

1. **Smart Personalized Feed Algorithm**: Posts are ranked dynamically based on followed users, shared interest alignment, post recency, discussion velocity, and engagement depth (`FOR YOU`, `FOLLOWING`, and `TRENDING` modes).
2. **Profile Interest Map**: Every user profile visually displays an interactive, weighted network of connected topics and interests (e.g. AI connected to Programming and Startups).
3. **Insightful Reactions**: Replaces single generic likes with meaningful feedback options:
   - 💡 **Insightful**
   - 🔥 **Interesting**
   - ❤️ **Like**
   - 👏 **Support**
   - 🤔 **Curious**
4. **Active Discussion Mode**: Posts with vibrant, multi-layered comment threads automatically activate a highlighted **🔥 Active Discussion** status.
5. **Smart People Recommendations**: Recommends creators using a calculated **% Interest Match** badge (e.g. `78% Interest Match`).
6. **Engagement Pulse Score**: A comprehensive creator reputation metric computed dynamically from posts, discussions, community participation, challenge completions, and insightful reactions.
7. **Achievement Badges**: Unlocks badges dynamically (`🏆 Early Explorer`, `🔥 7 Day Streak`, `💡 Idea Creator`, `💬 Discussion Starter`, `🌟 Community Builder`, `🚀 Rising Creator`, `🤝 Connector`).
8. **Positive Community Moderation**: Rule-based sentiment detector blocks toxic or abusive content before publication, displaying *"Please keep the conversation respectful."*
9. **Interactive Post Polls**: Live poll creation with real-time percentage progress fill visuals.
10. **Mood Tags**: Posts tagged with human emotional context (`😊 Happy`, `🚀 Excited`, `💡 Curious`, `🔥 Motivated`, `😌 Calm`, `🤔 Thoughtful`).
11. **Interest Communities**: Niche sub-communities (AI & Machine Learning, Web Development, Cybersecurity, Gaming Hub, Startup Founders) with dedicated feeds and member rosters.
12. **Community Challenges**: Weekly gamified challenges (e.g. `#7DaysOfCoding`, `#BuildIn24Hours`, `#LearningJourney`) with participant tracking.
13. **Trending Engine**: Analyzes hashtag frequency and velocity with growth indicators (`🔥 #ArtificialIntelligence +42% this week`).
14. **Creator Analytics**: Dedicated creator dashboard tracking total views, insightful reactions, discussion metrics, and engagement rate percentages with visual charts.
15. **Smart Profile Completion**: Real-time profile strength meter showing missing checklist items.
16. **Responsive Design & Dark Mode**: Modern startup UI with Glassmorphism accents, crisp dark mode palette, and mobile bottom navigation (`🏠 Home`, `🔎 Search`, `➕ Create`, `🔔 Activity`, `👤 Profile`).

---

## 💻 Tech Stack

### Frontend
- **HTML5 & Vanilla CSS3**: CSS Variables, Glassmorphism, Modern Flexbox/Grid, Animations
- **Vanilla JavaScript (ES6+)**: Fetch API, Async/Await, Modular Component Logic
- **No Third-Party Frameworks**: Clean HTML/CSS/JS without React/Vue overhead.

### Backend
- **Node.js & Express.js**: REST API server, custom middleware routing, error handling
- **JWT & bcryptjs**: Secure JSON Web Token authentication & password hashing
- **Content Moderation**: Custom rule-based sentiment checking

### Database
- **MongoDB & Mongoose**: Schemas for Users, Posts, Comments, Follows, Communities, Challenges, Notifications, Reactions, and Bookmarks.
- **MongoMemoryServer Fallback**: Automatic fallback to an in-memory MongoDB server if a local MongoDB service is not running.

---

## 📁 Project Structure

```
pulse/
├── frontend/
│   ├── index.html           # Premium Landing Page
│   ├── login.html           # Authentication Login
│   ├── register.html        # Registration with Interest Pills Selection
│   ├── home.html            # Main Dashboard (3-Column Layout & Smart Feed)
│   ├── profile.html         # Rich Profile, Interest Map Canvas & Badges
│   ├── search.html          # Global Search & Hashtags Page
│   ├── community.html       # Interest Communities & Details View
│   ├── challenge.html       # Community Challenges & Tracker
│   ├── activity.html        # Activity Center & Real Notifications
│   ├── analytics.html       # Creator Analytics Dashboard
│   │
│   ├── css/
│   │   ├── global.css       # Design System, Dark Mode & Tokens
│   │   ├── auth.css         # Auth & Interest Pills Styling
│   │   ├── dashboard.css    # Post Cards, Polls, Reactions & Comments
│   │   ├── profile.css      # Cover, Interest Map SVG & Badges Grid
│   │   ├── community.css    # Community Cards, Banner & Charts
│   │   └── responsive.css   # Breakpoints & Mobile Bottom Navbar
│   │
│   └── js/
│       ├── api.js           # API fetch client & Toast notification helper
│       ├── auth.js          # Authentication & Registration Handler
│       ├── home.js          # Dashboard Feed, Switcher & Widgets
│       ├── posts.js         # Post Card HTML Generator & Reactions Listener
│       ├── profile.js       # Profile Data, Interest Map SVG Renderer
│       ├── search.js        # Global Search Engine & Hashtag Explorer
│       ├── community.js     # Communities Grid, Join/Leave Logic
│       ├── challenges.js    # Weekly Challenges & Participant Handler
│       └── notifications.js # Activity Center Notifications & Badges
│
├── backend/
│   ├── server.js            # Express server entry point & static serving
│   ├── package.json
│   ├── .env
│   │
│   ├── config/
│   │   └── db.js            # Mongoose DB connector with Memory Server fallback
│   │
│   ├── models/              # Mongoose Schemas (User, Post, Comment, Follow, etc.)
│   ├── routes/              # Express API Routes
│   ├── controllers/         # Business logic controllers
│   ├── middleware/          # Auth JWT & Content Moderation middleware
│   └── utils/               # Pulse Score algorithm, Smart Feed & Seed Data
│
└── README.md
```

---

## 🔌 REST API Documentation

### Auth API
- `POST /api/auth/register` - Create user account with selected interests
- `POST /api/auth/login` - Authenticate user & return JWT token
- `GET /api/auth/me` - Get current authenticated user details

### Users API
- `GET /api/users/:id` - Fetch user profile, strength, and completion meter
- `PUT /api/users/:id` - Update profile bio, avatar, cover image, interests
- `GET /api/users/suggestions` - Get recommended people with % Interest Match
- `GET /api/users/:id/interest-map` - Fetch interest map nodes & links
- `POST /api/users/:id/follow` - Follow a creator
- `DELETE /api/users/:id/follow` - Unfollow a creator

### Posts & Interactions API
- `GET /api/posts` - Fetch Smart Feed (`?mode=FOR YOU|FOLLOWING|TRENDING`)
- `POST /api/posts` - Create post (Supports text, idea, question, poll, achievement)
- `POST /api/posts/:id/reaction` - Toggle Insightful, Curious, Support, Like reactions
- `POST /api/posts/:id/poll/vote` - Submit vote on poll option
- `POST /api/posts/:id/bookmark` - Bookmark post for later
- `POST /api/posts/:id/comments` - Submit comment (with moderation check)
- `GET /api/posts/:id/comments` - Fetch threaded comments & replies

### Communities & Challenges API
- `GET /api/communities` - List all interest communities
- `POST /api/communities/:id/join` - Join interest community
- `GET /api/challenges` - List active weekly community challenges
- `POST /api/challenges/:id/participate` - Participate in challenge

---

## 🛠️ Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Clone & Install Dependencies
```bash
cd backend
npm install
```

### 2. Launch the Application
Run the backend server:
```bash
npm start
```

The server will automatically:
1. Connect to MongoDB (or launch MongoMemoryServer if local MongoDB is absent).
2. Seed the database out-of-the-box with realistic demo creators (Alex, Sarah, David, Priya, Ryan), rich posts, communities, and challenges.
3. Serve the static frontend application at **`http://localhost:5000`**.

### 3. Accessing the App
Open your browser and navigate to:
```
http://localhost:5000
```

### Demo Credentials
You can log in with any of the seeded accounts:
- **Email:** `alex@pulse.dev` | **Password:** `password123`
- **Email:** `sarah@pulse.dev` | **Password:** `password123`
- **Email:** `david@pulse.dev` | **Password:** `password123`

---

## 📜 License
MIT License. Built for the PULSE Social Community Platform project.
