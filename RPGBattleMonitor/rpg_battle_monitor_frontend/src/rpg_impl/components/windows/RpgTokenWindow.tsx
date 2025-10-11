import { Asset } from "@/board_core/assets/game_assets";
import { GEventEmitter } from "@/board_core/board";
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
    NumberInput,
    Select,
    TextInput,
    Text,
    Checkbox,
    Stack,
    Image,
    ActionIcon,
    TagsInput,
} from "@mantine/core";
import { useDisclosure, useForceUpdate } from "@mantine/hooks";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { DefaultAssetPicker } from "../Assets/AssetPicker";
import { TextIncrementableNumberInput } from "../TextIncrementableNumberInput";
import { COMBAT_TAGS } from "@/rpg_impl/characters_stats/tags";

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

    const forceUpdate = useForceUpdate();

    const disabled = !editMode;
    const refreshTokens = useSetAtom(tokenAtoms.refreshTokens);

    const updatedFields = useRef<Partial<RpgTokenData>>({});

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
    const [size, setSize] = useState(token.size);

    const [tags, setTags] = useState(token.tags);

    const [opened, { close, open }] = useDisclosure(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [tokenImage, setTokenImage] = useState(token.image);

    const assetPickerFilter = (asset: Asset) => {
        if (searchTerm.trim().length === 0) {
            return true;
        }

        return asset.originalFilename
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
    };

    const queueUpdate = useCallback<
        <K extends RpgTokenDataPublicAttributes>(
            value: RpgTokenData[K],
            field: K,
        ) => void
    >(
        (value, field) => {
            updatedFields.current[field] = value;

            refreshTokens();
        },
        [refreshTokens],
    );

    const saveToken = useCallback(<
        K extends RpgTokenDataPublicAttributes,
    >() => {
        queueEntityUpdate(() => {
            Object.keys(updatedFields.current).forEach((field) => {
                const f = field as K;
                const data = updatedFields.current[f];
                if (data !== undefined) {
                    token[f] = data;
                }
            });

            updatedFields.current = {};

            return token;
        });

        refreshTokens();
        forceUpdate();
    }, [token, forceUpdate, refreshTokens]);

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
                setSize(token.size);
                setTokenImage(token.image);
                setTags(token.tags);
            }
        };

        GEventEmitter.on("entity-updated", updateComponent);

        return () => {
            GEventEmitter.off("entity-updated", updateComponent);
        };
    }, [token]);

    const isUpdated = () => {
        return (
            name !== token.name ||
            cClass !== token.class ||
            race !== token.race ||
            alignment !== token.alignment ||
            experience !== token.experience ||
            equipment !== token.equipment ||
            abilityScore !== token.abilityScore ||
            inspirationModifier !== token.inspirationModifier ||
            savingThrows !== token.savingThrows ||
            passiveWisdom !== token.passiveWisdom ||
            armorClass !== token.armorClass ||
            initiative !== token.initiative ||
            speed !== token.speed ||
            hitPoints !== token.hitPoints ||
            hitDice !== token.hitDice ||
            deathSaves !== token.deathSaves ||
            size !== token.size ||
            tokenImage !== token.image ||
            tags !== token.tags
        );
    };

    return (
        <Stack gap="xs" pb="xs" justify="center" align="stretch">
            <Fieldset legend="Image">
                <Stack gap="xs" pb="xs" justify="center" align="stretch">
                    {tokenImage && (
                        <Image
                            maw="512px"
                            mah="512px"
                            src={getUrl(tokenImage)}
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
                    )}
                    <DefaultAssetPicker
                        filter={assetPickerFilter}
                        onSelect={(asset) => {
                            setTokenImage(asset.url);
                            queueUpdate(asset.url, "image");
                            close();
                        }}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        opened={opened}
                        open={open}
                        close={close}
                    />
                </Stack>
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
                            // @ts-ignore
                            setAlignment(alignment);
                            // @ts-ignore
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
                                        const updatedScore = {
                                            ...abilityScore,
                                            [key]: { score: value },
                                        };
                                        setAbilityScore(updatedScore);
                                        queueUpdate(
                                            updatedScore,
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
                                                const updatedSavingThrows = {
                                                    ...savingThrows,
                                                    [key]: {
                                                        ...score,
                                                        proficient: value,
                                                    },
                                                };
                                                setSavingThrows(
                                                    updatedSavingThrows,
                                                );
                                                queueUpdate(
                                                    updatedSavingThrows,
                                                    "savingThrows",
                                                );
                                            }}
                                        />
                                    }
                                    value={score.score}
                                    onChange={(value) => {
                                        const updatedSavingThrows = {
                                            ...savingThrows,
                                            [key]: { ...score, score: value },
                                        };
                                        setSavingThrows(updatedSavingThrows);
                                        queueUpdate(
                                            updatedSavingThrows,
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
                                <TextIncrementableNumberInput
                                    key={key}
                                    disabled={disabled}
                                    label={key}
                                    initialValue={value}
                                    onChange={(value) => {
                                        const updatedHitpoints = {
                                            ...hitPoints,
                                            [key]: value,
                                        };
                                        setHitPoints(updatedHitpoints);
                                        queueUpdate(
                                            updatedHitpoints,
                                            "hitPoints",
                                        );
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
                                        const updatedDeathSaves = {
                                            ...deathSaves,
                                            [key]: value,
                                        };
                                        setDeathSaves(updatedDeathSaves);
                                        queueUpdate(
                                            updatedDeathSaves,
                                            "deathSaves",
                                        );
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
                                // @ts-ignore
                                queueUpdate(size, "size");
                            }
                        }}
                    />
                    <Text>TODO: Skill proficiency</Text>
                    <Fieldset legend="Tags">
                        <TagsInput
                            data={COMBAT_TAGS}
                            value={tags}
                            onChange={(tags) => {
                                setTags(tags);
                                queueUpdate(tags, "tags");
                            }}
                        />
                    </Fieldset>
                </Flex>
            </Fieldset>
            {isUpdated() && (
                <Flex justify="right">
                    <ActionIcon
                        title="Save"
                        color="green"
                        variant="outline"
                        onClick={() => {
                            saveToken();
                        }}
                    >
                        <IconDeviceFloppy />
                    </ActionIcon>
                </Flex>
            )}
        </Stack>
    );
};
