import { User, AiFeature } from '../types';
import { UsageLimitError } from '../utils/errors';

const SMART_ROUTINE_LIMIT = 2;

export const useAi = (
    user: User | null, 
    setUser: React.Dispatch<React.SetStateAction<User | null>>,
    openUpgradeModal: () => void
) => {

    const runAi = async <T>(aiCallback: () => Promise<T>, feature: AiFeature): Promise<T | void> => {
        if (!user) {
            throw new Error("User not found");
        }
        
        // Premium users have unlimited access
        if (user.plan === 'premium') {
            try {
                return await aiCallback();
            } catch (error) {
                 console.error(`An error occurred during AI execution for premium user:`, error);
                 throw error;
            }
        }

        // --- Free user logic ---
        if (feature === 'smartRoutine') {
            if (user.smartRoutineUses >= SMART_ROUTINE_LIMIT) {
                openUpgradeModal();
                throw new UsageLimitError('Smart Routine usage limit reached.');
            }

            try {
                const result = await aiCallback();
                // Increment usage on success
                setUser(prevUser => {
                     if (!prevUser) return null;
                     return {
                        ...prevUser,
                        smartRoutineUses: prevUser.smartRoutineUses + 1,
                     }
                });
                return result;
            } catch (error) {
                console.error("An error occurred during AI execution for smart routine:", error);
                throw error;
            }
        } else {
            // Any other feature is locked for free users
            openUpgradeModal();
            throw new UsageLimitError(`Feature '${feature}' is only available for premium users.`);
        }
    };

    return { runAi, smartRoutineUses: user?.smartRoutineUses ?? 0 };
};