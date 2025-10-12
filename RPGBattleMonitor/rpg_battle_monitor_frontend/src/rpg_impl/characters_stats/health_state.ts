import { RpgTokenData } from "../tokens/rpg_token_data";
import { PARTY_TAG, SPECIAL_NPC_TAG } from "./tags";

export enum HealthState {
    Healthy = "healthy",
    Unconcious = "unconcious",
    Stabilized = "stabilized",
    Dead = "dead",
}

export type HealthStateOptions = {
    damageOverflow: number;
    damaged: boolean;
    stabilize: boolean;
};

export function calculateNextHealthState(
    token: RpgTokenData,
    options?: Partial<HealthStateOptions>,
): HealthState {
    if (canFallUnconcius(token)) {
        return importantCharacterHealthState(token, options);
    }

    return otherCharacterHealthState(token);
}

function canFallUnconcius(token: RpgTokenData): boolean {
    return (
        token.tags.includes(PARTY_TAG) || token.tags.includes(SPECIAL_NPC_TAG)
    );
}

function otherCharacterHealthState(token: RpgTokenData): HealthState {
    if (token.hitPoints.current <= 0) {
        return HealthState.Dead;
    }

    return HealthState.Healthy;
}

function importantCharacterHealthState(
    token: RpgTokenData,
    options?: Partial<HealthStateOptions>,
): HealthState {
    if (token.hitPoints.current > 0) {
        return HealthState.Healthy;
    }

    if (token.healthState === HealthState.Unconcious && options?.stabilize) {
        return HealthState.Stabilized;
    }

    if (
        options?.damageOverflow &&
        options.damageOverflow >= token.hitPoints.maximum
    ) {
        return HealthState.Dead;
    }

    if (options?.damaged && token.healthState === HealthState.Stabilized) {
        return HealthState.Unconcious;
    }

    if (token.hitPoints.current <= 0 && token.deathSaves.successes >= 3) {
        return HealthState.Stabilized;
    }

    if (token.hitPoints.current <= 0 && token.deathSaves.failures < 3) {
        return HealthState.Unconcious;
    }

    if (token.hitPoints.current <= 0 && token.deathSaves.failures >= 3) {
        return HealthState.Dead;
    }

    console.error("Unhandled health state", token);

    return token.healthState;
}
