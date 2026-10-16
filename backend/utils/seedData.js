const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const Community = require('../models/Community');
const Challenge = require('../models/Challenge');
const Notification = require('../models/Notification');
const Reaction = require('../models/Reaction');
const Bookmark = require('../models/Bookmark');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Clearing old data...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Follow.deleteMany({});
    await Community.deleteMany({});
    await Challenge.deleteMany({});
    await Notification.deleteMany({});
    await Reaction.deleteMany({});
    await Bookmark.deleteMany({});

    console.log('[Seed] Generating password hashes...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const usersData = [
      {
        fullName: 'Alex Rivers',
        username: 'alexrivers',
        email: 'alex@pulse.dev',
        password: hashedPassword,
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        bio: 'AI researcher & full-stack builder. Passionate about human-centric algorithms & open source.',
        interests: ['AI/ML', 'Programming', 'Startups', 'Technology', 'Books'],
        pulseScore: 840,
        scoreBreakdown: { posts: 240, discussion: 310, community: 150, challenges: 80, connections: 60 },
        badges: [
          { id: 'early_explorer', title: '🏆 Early Explorer', icon: '🏆' },
          { id: 'idea_creator', title: '💡 Idea Creator', icon: '💡' },
          { id: 'rising_creator', title: '🚀 Rising Creator', icon: '🚀' }
        ]
      },
      {
        fullName: 'Sarah Chen',
        username: 'sarahchen',
        email: 'sarah@pulse.dev',
        password: hashedPassword,
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
        bio: 'Lead frontend architect & UI/UX designer. Crafting clean web experiences.',
        interests: ['Programming', 'Web Development', 'Photography', 'Art', 'Music'],
        pulseScore: 690,
        scoreBreakdown: { posts: 190, discussion: 260, community: 120, challenges: 70, connections: 50 },
        badges: [
          { id: 'early_explorer', title: '🏆 Early Explorer', icon: '🏆' },
          { id: 'community_builder', title: '🌟 Community Builder', icon: '🌟' }
        ]
      },
      {
        fullName: 'David Miller',
        username: 'davidm',
        email: 'david@pulse.dev',
        password: hashedPassword,
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        bio: 'Cybersecurity engineer & indie founder. Building safe web apps.',
        interests: ['Cybersecurity', 'Programming', 'Startups', 'Gaming'],
        pulseScore: 520,
        scoreBreakdown: { posts: 120, discussion: 200, community: 100, challenges: 60, connections: 40 },
        badges: [
          { id: 'early_explorer', title: '🏆 Early Explorer', icon: '🏆' }
        ]
      },
      {
        fullName: 'Priya Sharma',
        username: 'priyasharma',
        email: 'priya@pulse.dev',
        password: hashedPassword,
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
        bio: 'Data scientist & ML engineer exploring neural networks and NLP.',
        interests: ['AI/ML', 'Education', 'Books', 'Technology'],
        pulseScore: 610,
        scoreBreakdown: { posts: 160, discussion: 240, community: 110, challenges: 50, connections: 50 },
        badges: [
          { id: 'early_explorer', title: '🏆 Early Explorer', icon: '🏆' },
          { id: 'discussion_starter', title: '💬 Discussion Starter', icon: '💬' }
        ]
      },
      {
        fullName: 'Ryan Patel',
        username: 'ryanpatel',
        email: 'ryan@pulse.dev',
        password: hashedPassword,
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
        bio: 'Game dev & 3D graphics developer. Esports enthusiast.',
        interests: ['Gaming', 'Programming', 'Music', 'Fitness'],
        pulseScore: 450,
        scoreBreakdown: { posts: 110, discussion: 180, community: 90, challenges: 40, connections: 30 },
        badges: [{ id: 'early_explorer', title: '🏆 Early Explorer', icon: '🏆' }]
      }
    ];

    const users = await User.insertMany(usersData);
    const [alex, sarah, david, priya, ryan] = users;

    console.log('[Seed] Creating Communities...');
    const communitiesData = [
      {
        name: 'AI & Machine Learning',
        slug: 'ai-machine-learning',
        description: 'Explore state of the art AI models, neural networks, transformers, and ML innovations.',
        category: 'Technology',
        banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        icon: '🤖',
        creator: alex._id,
        members: [alex._id, priya._id, david._id],
        membersCount: 3,
        postsCount: 5
      },
      {
        name: 'Web Development',
        slug: 'web-development',
        description: 'Discuss modern web tech, CSS architectures, JavaScript engines, and full-stack platforms.',
        category: 'Programming',
        banner: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
        icon: '⚡',
        creator: sarah._id,
        members: [sarah._id, alex._id, ryan._id],
        membersCount: 3,
        postsCount: 4
      },
      {
        name: 'Startup Founders',
        slug: 'startup-founders',
        description: 'Building products from 0 to 1. Insights on fundraising, product-market fit, and team growth.',
        category: 'Business',
        banner: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
        icon: '🚀',
        creator: alex._id,
        members: [alex._id, david._id, sarah._id],
        membersCount: 3,
        postsCount: 3
      },
      {
        name: 'Gaming Hub',
        slug: 'gaming-hub',
        description: 'Indie game development, graphics programming, and gaming community highlights.',
        category: 'Gaming',
        banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
        icon: '🎮',
        creator: ryan._id,
        members: [ryan._id, david._id],
        membersCount: 2,
        postsCount: 2
      }
    ];

    const communities = await Community.insertMany(communitiesData);
    const [aiComm, webComm, startupComm, gamingComm] = communities;

    // Link user joined communities
    alex.joinedCommunities = [aiComm._id, startupComm._id, webComm._id];
    sarah.joinedCommunities = [webComm._id, startupComm._id];
    david.joinedCommunities = [aiComm._id, startupComm._id, gamingComm._id];
    priya.joinedCommunities = [aiComm._id];
    ryan.joinedCommunities = [webComm._id, gamingComm._id];

    await Promise.all([alex.save(), sarah.save(), david.save(), priya.save(), ryan.save()]);

    console.log('[Seed] Creating Challenges...');
    const challengesData = [
      {
        title: '7 Days of Coding',
        description: 'Commit code and post your daily breakthrough for 7 consecutive days!',
        hashtag: '#7DaysOfCoding',
        banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
        participants: [alex._id, sarah._id, priya._id],
        participantsCount: 3,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        badgeReward: '🏆 7-Day Coder'
      },
      {
        title: 'Build Something in 24 Hours',
        description: 'Hackathon style challenge: design, build, and publish a functional tool or app in 24 hours.',
        hashtag: '#BuildIn24Hours',
        banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
        participants: [alex._id, david._id],
        participantsCount: 2,
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        badgeReward: '⚡ Hackathon Pioneer'
      },
      {
        title: 'Share Your Learning Journey',
        description: 'Document a new topic or framework you studied this week with key takeaways.',
        hashtag: '#LearningJourney',
        banner: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&auto=format&fit=crop&q=80',
        participants: [priya._id, sarah._id, ryan._id],
        participantsCount: 3,
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        badgeReward: '📚 Curiosity Champion'
      }
    ];

    const challenges = await Challenge.insertMany(challengesData);

    console.log('[Seed] Creating Follow Relationships...');
    const followsData = [
      { follower: alex._id, following: sarah._id },
      { follower: alex._id, following: priya._id },
      { follower: sarah._id, following: alex._id },
      { follower: david._id, following: alex._id },
      { follower: priya._id, following: alex._id },
      { follower: priya._id, following: sarah._id },
      { follower: ryan._id, following: david._id }
    ];

    await Follow.insertMany(followsData);

    // Update follower/following counts
    alex.followersCount = 3;
    alex.followingCount = 2;
    sarah.followersCount = 2;
    sarah.followingCount = 1;
    david.followersCount = 1;
    david.followingCount = 1;
    priya.followersCount = 1;
    priya.followingCount = 2;
    ryan.followersCount = 0;
    ryan.followingCount = 1;

    await Promise.all([alex.save(), sarah.save(), david.save(), priya.save(), ryan.save()]);

    console.log('[Seed] Creating Posts...');
    const postsData = [
      {
        author: alex._id,
        content: 'I built my first AI application today using transformer embeddings and custom similarity routing 🚀 The responsiveness and accuracy were far beyond my expectations! What model architectures are you exploring recently?',
        postType: 'idea',
        mood: 'Excited',
        hashtags: ['#AI', '#MachineLearning', '#JavaScript', '#7DaysOfCoding'],
        topic: 'AI/ML',
        likesCount: 24,
        reactions: { insightful: 18, interesting: 12, like: 24, support: 9, curious: 7 },
        commentsCount: 5,
        sharesCount: 8,
        viewsCount: 340,
        community: aiComm._id,
        isDiscussion: true
      },
      {
        author: sarah._id,
        content: 'Vanilla CSS has evolved so remarkably! Modern CSS Grid, subgrid, container queries, and `@layer` allow crafting ultra-fluid startup interfaces without relying on bloated heavy CSS dependencies. Here is a preview of the clean design system we engineered.',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
        postType: 'image',
        mood: 'Motivated',
        hashtags: ['#WebDevelopment', '#CSS', '#UIUX', '#Design'],
        topic: 'Web Development',
        likesCount: 31,
        reactions: { insightful: 22, interesting: 15, like: 31, support: 14, curious: 4 },
        commentsCount: 3,
        sharesCount: 11,
        viewsCount: 420,
        community: webComm._id,
        isDiscussion: false
      },
      {
        author: alex._id,
        content: 'Quick Community Poll: Which backend stack do you prefer when building real-time scalable APIs for high-throughput platforms?',
        postType: 'poll',
        mood: 'Curious',
        hashtags: ['#Programming', '#Backend', '#NodeJS'],
        topic: 'Programming',
        poll: {
          question: 'Which backend stack do you prefer when building real-time scalable APIs?',
          options: [
            { optionText: 'Node.js / Express', votes: [alex._id, sarah._id, david._id] },
            { optionText: 'Python / FastApi', votes: [priya._id] },
            { optionText: 'Go / Fiber', votes: [ryan._id] },
            { optionText: 'Java / Spring Boot', votes: [] }
          ]
        },
        likesCount: 19,
        reactions: { insightful: 10, interesting: 14, like: 19, support: 5, curious: 12 },
        commentsCount: 2,
        sharesCount: 4,
        viewsCount: 280,
        community: startupComm._id
      },
      {
        author: priya._id,
        content: 'Completed Module 4 of Advanced Neural Attention Mechanisms! Understanding self-attention multi-head projection matrices mathematically gave me a whole new clarity on LLM context windows.',
        postType: 'achievement',
        mood: 'Happy',
        hashtags: ['#AI', '#LearningJourney', '#Education'],
        topic: 'AI/ML',
        likesCount: 15,
        reactions: { insightful: 14, interesting: 9, like: 15, support: 18, curious: 3 },
        commentsCount: 1,
        sharesCount: 2,
        viewsCount: 190,
        community: aiComm._id
      },
      {
        author: david._id,
        content: 'Pro-tip for startup developers: Always enforce zero-trust token invalidation and strict rate limiting on public endpoint routes before launching beta access. A single unthrottled API route can drain your cloud budget in hours.',
        postType: 'question',
        mood: 'Thoughtful',
        hashtags: ['#Cybersecurity', '#Startups', '#WebDev'],
        topic: 'Cybersecurity',
        likesCount: 28,
        reactions: { insightful: 26, interesting: 18, like: 28, support: 11, curious: 6 },
        commentsCount: 2,
        sharesCount: 9,
        viewsCount: 310,
        community: startupComm._id,
        isDiscussion: true
      },
      {
        author: ryan._id,
        content: 'Testing custom WebGL shaders for smooth lighting in our indie retro game project! Frame rates are holding steady at 120fps on integrated graphics.',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
        postType: 'image',
        mood: 'Excited',
        hashtags: ['#Gaming', '#GameDev', '#WebGL'],
        topic: 'Gaming',
        likesCount: 16,
        reactions: { insightful: 8, interesting: 19, like: 16, support: 10, curious: 5 },
        commentsCount: 1,
        sharesCount: 3,
        viewsCount: 210,
        community: gamingComm._id
      }
    ];

    const posts = await Post.insertMany(postsData);
    const [p1, p2, p3, p4, p5, p6] = posts;

    console.log('[Seed] Creating Comments & Threaded Replies...');
    const c1 = await Comment.create({
      post: p1._id,
      author: sarah._id,
      content: 'Fascinating architecture Alex! Did you use Node.js runtime or Python microservices for the embedding router?',
      sentiment: 'positive',
      likes: [alex._id],
      likesCount: 1
    });

    const c1_reply = await Comment.create({
      post: p1._id,
      author: alex._id,
      parentComment: c1._id,
      content: 'I used Node.js with native asynchronous worker threads! The IO performance is phenomenal and handles concurrent requests smoothly.',
      sentiment: 'positive',
      likes: [sarah._id, priya._id],
      likesCount: 2
    });

    const c1_reply2 = await Comment.create({
      post: p1._id,
      author: priya._id,
      parentComment: c1._id,
      content: 'Interesting choice! How are you handling vector indexing in memory?',
      sentiment: 'positive',
      likes: [alex._id],
      likesCount: 1
    });

    const c2 = await Comment.create({
      post: p1._id,
      author: david._id,
      content: 'Extremely insightful post! This is the exact kind of meaningful technical discussion social media needs.',
      sentiment: 'positive',
      likes: [alex._id],
      likesCount: 1
    });

    const c3 = await Comment.create({
      post: p2._id,
      author: alex._id,
      content: 'The glassmorphism cards and dark mode contrast look super sleek Sarah! Fantastic UI work.',
      sentiment: 'positive',
      likes: [sarah._id],
      likesCount: 1
    });

    console.log('[Seed] Creating Reactions & Notifications...');
    await Reaction.create({ user: sarah._id, post: p1._id, type: 'insightful' });
    await Reaction.create({ user: david._id, post: p1._id, type: 'interesting' });
    await Reaction.create({ user: priya._id, post: p1._id, type: 'curious' });
    await Reaction.create({ user: alex._id, post: p2._id, type: 'insightful' });

    await Notification.create({
      recipient: alex._id,
      sender: sarah._id,
      type: 'INSIGHT',
      message: 'Sarah Chen found your post insightful.',
      post: p1._id
    });

    await Notification.create({
      recipient: alex._id,
      sender: sarah._id,
      type: 'COMMENT',
      message: 'Sarah Chen commented on your post.',
      post: p1._id
    });

    await Notification.create({
      recipient: alex._id,
      sender: david._id,
      type: 'FOLLOW',
      message: 'David Miller started following you.'
    });

    console.log('[Seed] Database successfully seeded with rich demo data!');
  } catch (err) {
    console.error('[Seed Error]:', err);
  }
};

module.exports = seedDatabase;
