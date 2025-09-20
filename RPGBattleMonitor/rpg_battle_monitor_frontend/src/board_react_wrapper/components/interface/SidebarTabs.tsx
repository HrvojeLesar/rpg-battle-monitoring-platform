import { sidebarTabAtoms } from "@/board_react_wrapper/stores/sidebar_tab_store";
import { Tabs } from "@mantine/core";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

export const SidebarTabs = () => {
    const tabs = useAtomValue(sidebarTabAtoms.tabs);

    const [activeTab, setActiveTab] = useState<Option<string>>(
        tabs.at(0)?.value,
    );

    useEffect(() => {
        setActiveTab(tabs.at(0)?.value);
    }, [tabs]);

    return (
        <Tabs variant="outline" value={activeTab} onChange={setActiveTab}>
            <Tabs.List
                style={{
                    overflow: "auto",
                    flexWrap: "nowrap",
                }}
                mb="xs"
            >
                {tabs.map((tab, idx) => {
                    const Icon = tab.icon;

                    return (
                        <Tabs.Tab
                            key={idx}
                            value={tab.value}
                            leftSection={<Icon />}
                        >
                            {tab.title ?? tab.value}
                        </Tabs.Tab>
                    );
                })}
            </Tabs.List>

            {tabs.map((tab, idx) => {
                const Content = tab.content;
                return (
                    <Tabs.Panel key={idx} value={tab.value}>
                        {Content && <Content />}
                    </Tabs.Panel>
                );
            })}
        </Tabs>
    );
};
