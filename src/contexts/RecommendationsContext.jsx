import { createContext, useContext, useState } from "react";

const RecommendationsContext = createContext(null);

export function RecommendationsProvider({ children }) {
	const [hasRecommendations, setHasRecommendations] = useState(false);
	const [savedRecommendationsCount, setSavedRecommendationsCount] = useState(0);

	return (
		<RecommendationsContext.Provider
			value={{
				hasRecommendations,
				setHasRecommendations,
				savedRecommendationsCount,
				setSavedRecommendationsCount
			}}
		>
			{children}
		</RecommendationsContext.Provider>
	);
}

export function useRecommendations() {
	const context = useContext(RecommendationsContext);
	if (!context) {
		throw new Error("useRecommendations must be used within a RecommendationsProvider");
	}
	return context;
}
