export const getPlayerXpForLevel = (level) => {
	const safeLevel = Math.max(1, level);
	const earlyLevel = Math.min(10, safeLevel);
	const earlyTarget = Math.floor(150 + Math.pow(earlyLevel, 1.3) * 60);

	if (safeLevel <= 10) {
		return earlyTarget;
	}

	const lateLevels = safeLevel - 10;
	return Math.floor(earlyTarget + Math.pow(lateLevels, 1.6) * 140);
};
