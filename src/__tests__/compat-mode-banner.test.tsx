import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CompatModeBanner } from "../components/banners/CompatModeBanner";
import Platform from "../helpers/Platform";
import { useAppStore } from "../zustand/app";

beforeEach(() => {
    useAppStore.setState({ locale: "en", compatMode: undefined });
});

afterEach(() => {
    cleanup();
});

describe("CompatModeBanner", () => {
    it("renders nothing while the sandbox is enabled", () => {
        render(<CompatModeBanner />);

        expect(screen.queryByText(/compatibility mode/i)).toBeNull();
    });

    it("renders nothing when only a stale, inactive record exists", () => {
        useAppStore.setState({ compatMode: { active: false, logPath: "main.log" } });

        render(<CompatModeBanner />);

        expect(screen.queryByText(/compatibility mode/i)).toBeNull();
    });

    it("explains compatibility mode and offers the log and a retry", () => {
        useAppStore.setState({ compatMode: { active: true, logPath: "main.log" } });

        render(<CompatModeBanner />);

        expect(screen.getByText(/compatibility mode/i)).toBeTruthy();
        expect(screen.getByText("Show log")).toBeTruthy();
        expect(screen.getByText("Try normal mode")).toBeTruthy();
    });

    it("is inactive on the web platform and the new actions are safe no-ops", async () => {
        expect(await Platform.current.getCompatMode()).toEqual({ active: false, logPath: "" });
        expect(() => Platform.current.disableCompatMode()).not.toThrow();
        expect(() => Platform.current.showMainLog()).not.toThrow();
    });
});
