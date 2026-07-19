import "./header.css";
import logoImg from "../assets/logo.png";
import { createContext, useContext, useState, type ReactNode } from "react";

export function useHeaderContext() {
	const headerContext = useContext(HeaderContextProvider);

	if (!headerContext) {
		throw new Error(
			"All components that use the header context must be placed within a HeaderContext element.",
		);
	}

	return headerContext;
}

const HeaderContextProvider = createContext<{
	setChildren: (children: ReactNode) => void;
} | null>(null);

export function HeaderContext({ children: consumer }: { children: ReactNode }) {
	const [children, setChildren] = useState<ReactNode>(null);

	return (
		<>
			<Header>{children}</Header>
			<HeaderContextProvider.Provider value={{ setChildren }}>
				{consumer}
			</HeaderContextProvider.Provider>
		</>
	);
}

function Header({ children }: { children: ReactNode }) {
	return (
		<header className="header flex">
			<a className="logo" href="/celesteStats/">
				<img src={logoImg} />
			</a>
			{children}
		</header>
	);
}
