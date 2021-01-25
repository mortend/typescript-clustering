import PriorityQueue from "./PriorityQueue"

/**
 * OPTICS - Ordering points to identify the clustering structure
 *
 * @author Lukasz Krawczyk <contact@lukaszkrawczyk.eu>
 * @copyright MIT
 */
export default class OPTICS {
    epsilon = 1
    minPts = 1

    distance: (p: number[], q: number[]) => number

    // temporary variables used during computation

    private _reachability: number[] = []
    private _processed: number[] = []
    private _coreDistance: number | undefined = 0
    private _orderedList: number[] = []
    private dataset: number[][] = []
    private clusters: number[][] = []

    /**
     * OPTICS class constructor
     */
    constructor(dataset?: number[][], epsilon?: number, minPts?: number, distanceFunction?: (p: number[], q: number[]) => number) {
        this.distance = this._euclideanDistance
        this._init(dataset, epsilon, minPts, distanceFunction)
    }

    /******************************************************************************/
    // public functions

    /**
     * Start clustering
     */
    run(dataset: number[][], epsilon: number, minPts: number, distanceFunction?: (p: number[], q: number[]) => number) {
        this._init(dataset, epsilon, minPts, distanceFunction)

        for (let pointId = 0, l = this.dataset.length; pointId < l; pointId++) {
            if (this._processed[pointId] !== 1) {
                this._processed[pointId] = 1
                this.clusters.push([pointId])
                const clusterId = this.clusters.length - 1

                this._orderedList.push(pointId)
                const priorityQueue = new PriorityQueue(null, null, "asc")
                const neighbors = this._regionQuery(pointId)

                // using priority queue assign elements to new cluster
                if (this._distanceToCore(pointId) !== undefined) {
                    this._updateQueue(pointId, neighbors, priorityQueue)
                    this._expandCluster(clusterId, priorityQueue)
                }
            }
        }

        return this.clusters
    }

    /**
     * Generate reachability plot for all points
     */
    getReachabilityPlot() {
        const reachabilityPlot = []

        for (let i = 0, l = this._orderedList.length; i < l; i++) {
            const pointId = this._orderedList[i]
            const distance = this._reachability[pointId]

            reachabilityPlot.push([pointId, distance])
        }

        return reachabilityPlot
    }

    /******************************************************************************/
    // protected functions

    /**
     * Set object properties
     */
    protected _init(dataset?: number[][], epsilon?: number, minPts?: number, distance?: (p: number[], q: number[]) => number) {
        if (dataset) {
            if (!(dataset instanceof Array)) {
                throw Error("Dataset must be of type array, " + typeof dataset + " given")
            }

            this.dataset = dataset
            this.clusters = []
            this._reachability = new Array(this.dataset.length)
            this._processed = new Array(this.dataset.length)
            this._coreDistance = 0
            this._orderedList = []
        }

        if (epsilon) {
            this.epsilon = epsilon
        }

        if (minPts) {
            this.minPts = minPts
        }

        if (distance) {
            this.distance = distance
        }
    }

    /**
     * Update information in queue
     */
    protected _updateQueue(pointId: number, neighbors: number[], queue: PriorityQueue) {
        const self = this

        this._coreDistance = this._distanceToCore(pointId)
        neighbors.forEach(function (pointId2) {
            if (self._processed[pointId2] === undefined) {
                const dist = self.distance(self.dataset[pointId], self.dataset[pointId2])
                const newReachableDistance = Math.max(self._coreDistance ?? 0, dist)

                if (self._reachability[pointId2] === undefined) {
                    self._reachability[pointId2] = newReachableDistance
                    queue.insert(pointId2, newReachableDistance)
                } else {
                    if (newReachableDistance < self._reachability[pointId2]) {
                        self._reachability[pointId2] = newReachableDistance
                        queue.remove(pointId2)
                        queue.insert(pointId2, newReachableDistance)
                    }
                }
            }
        })
    }

    /**
     * Expand cluster
     */
    protected _expandCluster(clusterId: number, queue: PriorityQueue) {
        const queueElements = queue.getElements()

        for (let p = 0, l = queueElements.length; p < l; p++) {
            const pointId = queueElements[p]
            if (this._processed[pointId] === undefined) {
                const neighbors = this._regionQuery(pointId)
                this._processed[pointId] = 1

                this.clusters[clusterId].push(pointId)
                this._orderedList.push(pointId)

                if (this._distanceToCore(pointId) !== undefined) {
                    this._updateQueue(pointId, neighbors, queue)
                    this._expandCluster(clusterId, queue)
                }
            }
        }
    }

    /**
     * Calculating distance to cluster core
     */
    protected _distanceToCore(pointId: number) {
        const l = this.epsilon
        for (let coreDistCand = 0; coreDistCand < l; coreDistCand++) {
            const neighbors = this._regionQuery(pointId, coreDistCand)
            if (neighbors.length >= this.minPts) {
                return coreDistCand
            }
        }

        return
    }

    /**
     * Find all neighbors around given point
     */
    protected _regionQuery(pointId: number, epsilon?: number) {
        epsilon = epsilon || this.epsilon
        const neighbors = []

        for (let id = 0, l = this.dataset.length; id < l; id++) {
            if (this.distance(this.dataset[pointId], this.dataset[id]) < epsilon) {
                neighbors.push(id)
            }
        }

        return neighbors
    }

    /******************************************************************************/
    // helpers

    /**
     * Calculate euclidean distance in multidimensional space
     */
    protected _euclideanDistance(p: number[], q: number[]) {
        let sum = 0
        let i = Math.min(p.length, q.length)

        while (i--) {
            sum += (p[i] - q[i]) * (p[i] - q[i])
        }

        return Math.sqrt(sum)
    }
}
