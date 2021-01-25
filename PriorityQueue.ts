/**
 * PriorityQueue
 * Elements in this queue are sorted according to their value
 *
 * @author Lukasz Krawczyk <contact@lukaszkrawczyk.eu>
 * @copyright MIT
 */
export default class PriorityQueue {
    _queue: number[] = []
    _priorities: number[] = []
    _sorting = "desc"

    /**
     * PriorityQueue class construcotr
     *
     * @example
     * queue: [1,2,3,4]
     * priorities: [4,1,2,3]
     * > result = [1,4,2,3]
     */
    constructor(elements: number[] | null, priorities: number[] | null, sorting: string) {
        this._init(elements, priorities, sorting)
    }

    /**
     * Insert element
     */
    insert(ele: number, priority: number) {
        let indexToInsert = this._queue.length
        let index = indexToInsert

        while (index--) {
            const priority2 = this._priorities[index]
            if (this._sorting === "desc") {
                if (priority > priority2) {
                    indexToInsert = index
                }
            } else {
                if (priority < priority2) {
                    indexToInsert = index
                }
            }
        }

        this._insertAt(ele, priority, indexToInsert)
    }

    /**
     * Remove element
     */
    remove(ele: number) {
        let index = this._queue.length

        while (index--) {
            const ele2 = this._queue[index]
            if (ele === ele2) {
                this._queue.splice(index, 1)
                this._priorities.splice(index, 1)
                break
            }
        }
    }

    /**
     * For each loop wrapper
     */
    forEach(func: (value: number, index: number, array: number[]) => void) {
        this._queue.forEach(func)
    }

    getElements() {
        return this._queue
    }

    getElementPriority(index: number) {
        return this._priorities[index]
    }

    getPriorities() {
        return this._priorities
    }

    getElementsWithPriorities() {
        const result = []

        for (let i = 0, l = this._queue.length; i < l; i++) {
            result.push([this._queue[i], this._priorities[i]])
        }

        return result
    }

    /**
     * Set object properties
     */
    protected _init(elements: number[] | null, priorities: number[] | null, sorting: string) {
        if (elements && priorities) {
            this._queue = []
            this._priorities = []

            if (elements.length !== priorities.length) {
                throw new Error("Arrays must have the same length")
            }

            for (let i = 0; i < elements.length; i++) {
                this.insert(elements[i], priorities[i])
            }
        }

        if (sorting) {
            this._sorting = sorting
        }
    }

    /**
     * Insert element at given position
     */
    protected _insertAt(ele: number, priority: number, index: number) {
        if (this._queue.length === index) {
            this._queue.push(ele)
            this._priorities.push(priority)
        } else {
            this._queue.splice(index, 0, ele)
            this._priorities.splice(index, 0, priority)
        }
    }
}
