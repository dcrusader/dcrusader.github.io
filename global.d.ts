interface Moment {
    add(days: number, part: string): Moment;
}

declare function prettyPrint(): void;
declare function moment(): Moment;

interface Window {
    App: App;
}

interface Promise {
    caught(ex: any): void;
}

interface App {
    Store: Storage;
    SupportsLocalStorage(): boolean;
    LocalStorage: Storage;
    Cookies: Storage;

    CurrentAssignment: string;
    CheckAnswers(): void;
    GetQueryParams(): Dictionary<string, string>;
    FromQuery(key: string): string;

    async Load(name: string): void;
    async WireUpQuestions(): void;
    async RestoreAnswers(): void;
}

interface Storage {
    KeyExists(key: string): boolean;
    Delete(key: string): void;
    Get<T>(key: string): T;
    Set<T>(key: string, value: T, expires?: Date | Moment, path?: string): boolean;
}