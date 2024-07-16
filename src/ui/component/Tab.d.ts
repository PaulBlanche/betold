import type { PropsWithChildren } from "../dom/dom";

type TabProps = {
	name: string;
};

type TabContainerProps = {};

export function Tab(props: PropsWithChildren<TabProps>): DocumentFragment;

export function TabContainer(
	props: PropsWithChildren<TabContainerProps>,
): DocumentFragment;
