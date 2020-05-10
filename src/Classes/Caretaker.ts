export interface Memento {
}

export interface Originator {
    getSnapshot(): Memento;
    restoreSnapshot(snapshot: Memento): void;
}

export class Caretaker {
    private history: Memento[] = [];
    private currentHistoryIndex: number;
    private readonly originator: Originator;
    private readonly maxHistorySize: number;

    constructor(maxHistorySize: number, originator: Originator) {
        this.maxHistorySize = maxHistorySize;
        this.originator = originator;
        this.currentHistoryIndex = -1;
        this.save();
    }

    undo(): void {
        if (this.undosLeft()) {
            this.currentHistoryIndex--;
            const mementoToRestore = this.history[this.currentHistoryIndex];
            this.originator.restoreSnapshot(mementoToRestore);
        }
    }

    redo(): void {
        if (this.redosLeft()) {
            this.currentHistoryIndex++;
            const mementoToRestore = this.history[this.currentHistoryIndex];
            this.originator.restoreSnapshot(mementoToRestore);
        }
    }

    save(): void {
        const relativeHistory = this.history.slice(0, this.currentHistoryIndex + 1);
        this.history = relativeHistory.concat(this.originator.getSnapshot());
        this.currentHistoryIndex++;
        this.fixHistorySize();
    }

    undosLeft(): boolean {
        return this.inHistoryBounds(this.currentHistoryIndex - 1);
    }

    redosLeft(): boolean {
        return this.inHistoryBounds(this.currentHistoryIndex + 1);
    }

    private fixHistorySize(): void {
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(1, this.maxHistorySize + 1);
            this.currentHistoryIndex = this.history.length - 1;
        }
    }

    private inHistoryBounds(index: number): boolean {
        const outsideBounds: boolean = index < 0 || index >= this.history.length;
        return !outsideBounds;
    }
}

export class CaretakerSet {
    private readonly caretakers: Caretaker[] = [];

    constructor(maxHistorySize: number, ...originators: Originator[]) {
        originators.forEach(originator => {
            this.caretakers.push(new Caretaker(maxHistorySize, originator));
        });
    }

    undo(): void {
        this.caretakers.forEach(c => c.undo());
    }

    redo(): void {
        this.caretakers.forEach(c => c.redo());
    }

    save(): void {
        this.caretakers.forEach(c => c.save());
    }

    undosLeft(): boolean {
        return this.caretakers[0].undosLeft();
    }

    redosLeft(): boolean {
        return this.caretakers[0].redosLeft();
    }
}

