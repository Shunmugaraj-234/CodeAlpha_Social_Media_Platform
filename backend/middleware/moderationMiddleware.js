const toxicWords = [
  'hate', 'stupid', 'idiot', 'fool', 'trash', 'dumb', 'bastard', 'scam', 'abuse', 
  'toxic', 'loser', 'useless', 'shut up', 'ugly', 'scumbag'
];

const checkModeration = (req, res, next) => {
  const content = req.body.content || req.body.bio || '';
  if (!content) return next();

  const lower = content.toLowerCase();
  const matched = toxicWords.filter(word => lower.includes(word));

  if (matched.length > 0) {
    return res.status(400).json({
      message: 'Please keep the conversation respectful.',
      flagged: true,
      matchedWords: matched
    });
  }

  next();
};

module.exports = { checkModeration, toxicWords };
