import { GBoard, GEventEmitter } from "@/board_core/board";
import { IMessagable } from "@/board_core/interfaces/messagable";
import { GDragAndDropRegistry } from "@/board_core/registry/drag_and_drop_registry";
import { tokenAtoms } from "@/board_react_wrapper/stores/token_store";
import { WindowEntry } from "@/board_react_wrapper/stores/window_store";
import { getUrl } from "@/board_react_wrapper/utils/utils";
import {
    abilityScoreModifier,
    AbilityScoreType,
} from "@/rpg_impl/characters_stats/ability_score";
import { Alignment } from "@/rpg_impl/characters_stats/alignment";
import {
    isValidSize,
    sizeMap,
    type Size,
} from "@/rpg_impl/characters_stats/combat";
import { Races } from "@/rpg_impl/characters_stats/race";
import { RpgTokenData } from "@/rpg_impl/tokens/rpg_token_data";
import { RPG_TOKEN_DROP } from "@/rpg_impl/utils/rpg_token_drop";
import { queueEntityUpdate } from "@/websocket/websocket";
import {
    Fieldset,
    Flex,
    MultiSelect,
    NumberInput,
    Select,
    TextInput,
    Text,
    Checkbox,
    Stack,
    Image,
} from "@mantine/core";
import { useDebouncedCallback, useForceUpdate } from "@mantine/hooks";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";

export const RPG_TOKEN_WINDOW_PREFIX = "rpg-token-";

export const getRpgTokenWindowName = (token: RpgTokenData): string => {
    return `${RPG_TOKEN_WINDOW_PREFIX}${token.getUId()}`;
};

export const openRpgTokenWindow = (token: RpgTokenData): WindowEntry => {
    return {
        title: `Rpg Token`,
        content: (
            <div>
                <CharacterSheet token={token} editMode={true} />
            </div>
        ),
        name: getRpgTokenWindowName(token),
    };
};

export type CharacterSheetProps = {
    token: RpgTokenData;
    editMode: boolean;
};

type RpgTokenDataPublicAttributes = keyof InstanceType<typeof RpgTokenData>;

export const CharacterSheet = (props: CharacterSheetProps) => {
    const { token, editMode } = props;

    const disabled = !editMode;
    const refreshTokens = useSetAtom(tokenAtoms.refreshTokens);

    const [name, setName] = useState(token.name);
    const [cClass, setClass] = useState(token.class);
    const [race, setRace] = useState(token.race);
    const [alignment, setAlignment] = useState(token.alignment);
    const [experience, setExperience] = useState(token.experience);
    const [equipment, setEquipment] = useState(token.equipment);
    const [abilityScore, setAbilityScore] = useState(token.abilityScore);
    const [inspirationModifier, setInspirationModifier] = useState(
        token.inspirationModifier,
    );
    const [savingThrows, setSavingThrows] = useState(token.savingThrows);
    const [passiveWisdom, setPassiveWisdom] = useState(token.passiveWisdom);
    const [armorClass, setArmorClass] = useState(token.armorClass);
    const [initiative, setInitiative] = useState(token.initiative);
    const [speed, setSpeed] = useState(token.speed);
    const [hitPoints, setHitPoints] = useState(token.hitPoints);
    const [hitDice, setHitDice] = useState(token.hitDice);
    const [deathSaves, setDeathSaves] = useState(token.deathSaves);
    const [size, setSize] = useState(token._size);

    const queueUpdate = useDebouncedCallback<
        <K extends RpgTokenDataPublicAttributes>(
            value: RpgTokenData[K],
            field: K,
        ) => void
    >((value, field) => {
        token[field] = value;

        queueEntityUpdate(() => {
            return token;
        });

        refreshTokens();
    }, 200);

    useEffect(() => {
        const updateComponent = (entity: IMessagable) => {
            if (entity === token) {
                setName(token.name);
                setClass(token.class);
                setRace(token.race);
                setAlignment(token.alignment);
                setExperience(token.experience);
                setEquipment(token.equipment);
                setAbilityScore(token.abilityScore);
                setInspirationModifier(token.inspirationModifier);
                setSavingThrows(token.savingThrows);
                setPassiveWisdom(token.passiveWisdom);
                setArmorClass(token.armorClass);
                setInitiative(token.initiative);
                setSpeed(token.speed);
                setHitPoints(token.hitPoints);
                setHitDice(token.hitDice);
                setDeathSaves(token.deathSaves);
                setSize(token._size);
            }
        };

        GEventEmitter.on("entity-updated", updateComponent);

        return () => {
            GEventEmitter.off("entity-updated", updateComponent);
        };
    }, [token]);

    return (
        <Stack gap="xs" pb="xs" justify="center" align="stretch">
            <Fieldset legend="Image">
                <Flex justify="center" align="center">
                    <Image
                        maw="512px"
                        mah="512px"
                        src={getUrl(token.image ?? "")}
                        style={{
                            alignSelf: "center",
                        }}
                        draggable
                        onDragStart={(e) => {
                            GDragAndDropRegistry.emit(
                                e as unknown as DragEvent,
                                RPG_TOKEN_DROP,
                                token.getUId(),
                            );
                        }}
                    />
                </Flex>
            </Fieldset>
            <Fieldset style={{ overflow: "auto" }} legend="Character Info">
                <Flex gap="xs" wrap="wrap">
                    <TextInput
                        disabled={disabled}
                        label="Name"
                        value={name}
                        onChange={(e) => {
                            const value = e.target.value;
                            setName(value);
                            queueUpdate(value, "name");
                        }}
                    />
                    <Text>TODO: class + class level</Text>
                    <Select
                        disabled={disabled}
                        label="Race"
                        data={Object.keys(Races)}
                        value={race}
                        onChange={(value) => {
                            const race = value ?? undefined;
                            setRace(race);
                            queueUpdate(race, "race");
                        }}
                    />
                    <Select
                        disabled={disabled}
                        label="Alignment"
                        data={Object.keys(Alignment)}
                        value={alignment}
                        onChange={(value) => {
                            const alignment = value ?? undefined;
                            setAlignment(alignment);
                            queueUpdate(alignment, "alignment");
                        }}
                    />
                    <Text>TODO: Character Level</Text>
                    <Text>TODO: Equipment</Text>
                    <Fieldset legend="Ability score">
                        {Object.entries(abilityScore).map(([key, score]) => {
                            const abilityScoreType = key as AbilityScoreType;
                            const scoreValue = score.score;
                            const modifier = abilityScoreModifier(
                                scoreValue,
                                abilityScoreType,
                            );
                            const modifierText = () => {
                                if (modifier === 0) {
                                    return "0";
                                }

                                return modifier > 0
                                    ? `+${modifier}`
                                    : `${modifier}`;
                            };

                            return (
                                <NumberInput
                                    key={key}
                                    disabled={disabled}
                                    label={key}
                                    leftSection={<Text>{modifierText()}</Text>}
                                    value={score.score}
                                    onChange={(value) => {
                                        const abilityScore = {
                                            ...token.abilityScore,
                                            [key]: { score: value },
                                        };
                                        setAbilityScore(abilityScore);
                                        queueUpdate(
                                            abilityScore,
                                            "abilityScore",
                                        );
                                    }}
                                />
                            );
                        })}
                    </Fieldset>
                    <NumberInput
                        disabled={disabled}
                        label="Inspiration modifier"
                        value={inspirationModifier}
                        onChange={(value) => {
                            const convertedValue = Number(value);
                            setInspirationModifier(convertedValue);
                            queueUpdate(convertedValue, "inspirationModifier");
                        }}
                    />
                    <Fieldset legend="Saving throws">
                        {Object.entries(savingThrows).map(([key, score]) => {
                            return (
                                <NumberInput
                                    key={key}
                                    disabled={disabled}
                                    label={key}
                                    leftSection={
                                        <Checkbox
                                            checked={score.proficient}
                                            disabled={disabled}
                                            onChange={(event) => {
                                                const value =
                                                    event.currentTarget.checked;
                                                const savingThrows = {
                                                    ...token.savingThrows,
                                                    [key]: {
                                                        ...score,
                                                        proficient: value,
                                                    },
                                                };
                                                setSavingThrows(savingThrows);
                                                queueUpdate(
                                                    savingThrows,
                                                    "savingThrows",
                                                );
                                            }}
                                        />
                                    }
                                    value={score.score}
                                    onChange={(value) => {
                                        const savingThrows = {
                                            ...token.savingThrows,
                                            [key]: { ...score, score: value },
                                        };
                                        setSavingThrows(savingThrows);
                                        queueUpdate(
                                            savingThrows,
                                            "savingThrows",
                                        );
                                    }}
                                />
                            );
                        })}
                    </Fieldset>
                    <NumberInput
                        disabled={disabled}
                        label="Passive wisdom"
                        value={passiveWisdom}
                        onChange={(value) => {
                            const convertedValue = Number(value);
                            setPassiveWisdom(convertedValue);
                            queueUpdate(convertedValue, "passiveWisdom");
                        }}
                    />
                    <NumberInput
                        disabled={disabled}
                        label="Armor class"
                        value={armorClass}
                        onChange={(value) => {
                            const convertedValue = Number(value);
                            setArmorClass(convertedValue);
                            queueUpdate(convertedValue, "armorClass");
                        }}
                    />
                    <NumberInput
                        disabled={true}
                        label="Initiative"
                        value={""}
                    />
                    <NumberInput
                        disabled={disabled}
                        label="Speed"
                        value={speed.walk}
                        onChange={(value) => {
                            const convertedValue = Number(value);
                            const speed = {
                                ...token.speed,
                                walk: convertedValue,
                            };
                            setSpeed(speed);
                            queueUpdate(speed, "speed");
                        }}
                    />
                    <Fieldset legend="Hit Points">
                        {Object.entries(hitPoints).map(([key, value]) => {
                            return (
                                <NumberInput
                                    key={key}
                                    disabled={disabled}
                                    label={key}
                                    value={value}
                                    onChange={(value) => {
                                        const hitpoints = {
                                            ...token.hitPoints,
                                            [key]: value,
                                        };
                                        setHitPoints(hitpoints);
                                        queueUpdate(hitpoints, "hitPoints");
                                    }}
                                />
                            );
                        })}
                    </Fieldset>
                    <Fieldset legend="Death saves">
                        {Object.entries(deathSaves).map(([key, value]) => {
                            return (
                                <NumberInput
                                    key={key}
                                    disabled={disabled}
                                    label={key}
                                    value={value}
                                    onChange={(value) => {
                                        const deathSaves = {
                                            ...token.deathSaves,
                                            [key]: value,
                                        };
                                        setDeathSaves(deathSaves);
                                        queueUpdate(deathSaves, "deathSaves");
                                    }}
                                />
                            );
                        })}
                    </Fieldset>
                    <Select
                        disabled={disabled}
                        label="Size"
                        data={sizeMap}
                        value={size}
                        onChange={(value) => {
                            const size = value ?? undefined;
                            if (isValidSize(size)) {
                                setSize(size as unknown as Size);
                                queueUpdate(size, "size");
                            }
                        }}
                    />
                    <Text>TODO: Skill proficiency</Text>
                </Flex>
            </Fieldset>
        </Stack>
    );
};
