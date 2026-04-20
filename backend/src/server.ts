import app from './index.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`SmartSeason Local API running on http://localhost:${PORT}`);
});
