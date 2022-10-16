class Graph {
    constructor() {
        this.numEdges = 0;
        this.vertices = {};
    }

    /**
     * Insert a new vertex into the graph.
     * 
     * @param data the data item stored in the new vertex
     * @return true if the data can be inserted as a new vertex, false if it is 
     *     already in the graph
     * @throws NullPointerException if data is null
     */
    insertVertex(data) {
        if (data == null) {
            throw new Error("Cannot add null vertex.");
        }
        if (data in this.vertices) return false;
        this.vertices[data] = new Vertex(data);
        return true;
    }

    /**
     * Remove a vertex from the graph.
     * Also removes all edges adjacent to the vertex from the graph (all edges 
     * that have the vertex as a source or a destination vertex).
     * 
     * @param data the data item stored in the vertex to remove
     * @returns true if a vertex with *data* has been removed, false if it was not in the graph
     */
    removeVertex(data) {
        if (data == null) {
            throw new Error("Cannot remove null vertex.");
        }
        if (!(data in this.vertices)) return false; // can't remove vertex that isn't there
        let toRemove = this.vertices[data];
        Object.values(this.vertices).forEach(v => { // search all vertices for edges targeting removeVertex
            let removeEdge = null;
            v.edgesLeaving.forEach(e => { // check the edges
                if (e.target == toRemove) removeEdge = e;
            })
            if (removeEdge != null) v.edgesLeaving = arrayRemove(v.edgesLeaving, removeEdge); // this if fine because vertex can only point to removed vertex once
        })
        return (delete this.vertices[data])
    }

    /**
     * Insert a new directed edge with a positive edge weight into the graph.
     * 
     * @param source the data item contained in the source vertex for the edge
     * @param target the data item contained in the target vertex for the edge
     * @param weight the weight for the edge (has to be a positive integer)
     * @returns true if the edge could be inserted or its weight updated, false 
     *     if the edge with the same weight was already in the graph
     */
    insertEdge(source, target, weight) {
        if (source == null || target == null)
            throw new Error("Cannot add edge with null source or target");
        let sourceVertex = this.vertices[source];
        let targetVertex = this.vertices[target];
        if (sourceVertex == null || targetVertex == null)
            throw new Error("Cannot add edge with vertices that do not exist");
        if (weight < 0)
            throw new Error("Cannot add edge with negative weight");
        // handle cases where edge already exists between these vertices
        sourceVertex.edgesLeaving.forEach(e => {
            if (e.target == targetVertex) {
                if (e.weight == weight) return false; // edge already exists
                else e.weight = weight; // otherwise update weight of existing edge
                return true;
            }
        })
        // otherwise add new edge to sourceVertex
        sourceVertex.edgesLeaving.push(new Edge(targetVertex, weight));
        // purely to ensure edges to same vertex don't get added twice
        if (source != target) {
            targetVertex.edgesLeaving.push(new Edge(sourceVertex, weight));
        }
        this.numEdges += 2;
        return true;
    }

    removeEdge(source, target) {
        if (source == null || target == null) throw new Error("Cannot remove edge with null source or target");
        let sourceVertex = this.vertices[source];
        let targetVertex = this.vertices[target];
        if (sourceVertex == null || targetVertex == null) throw new Error("Cannot remove edge with vertices that do not exist");
        // find edge to remove
        let removeEdge = null;
        let sourceRemoved = false;
        let targetRemoved = false;
        sourceVertex.edgesLeaving.forEach(e => {
            if (e.target == targetVertex)
                removeEdge = e;
        })
        if (removeEdge != null) { // remove edge that is successfully found                
            sourceVertex.edgesLeaving = arrayRemove(sourceVertex.edgesLeaving, removeEdge);
            sourceRemoved = true;
        }
        // repeat for target vertex
        removeEdge = null;
        targetVertex.edgesLeaving.forEach(e => {
            if (e.target == targetVertex)
                removeEdge = e;
        })
        if (removeEdge != null) { // remove edge that is successfully found                
            targetVertex.edgesLeaving = arrayRemove(targetVertex.edgesLeaving, removeEdge);
            targetRemoved = true;
        }
        return (targetRemoved && sourceRemoved); // otherwise return false to indicate failure to find
    }

    containsVertex(data) {
        return (data in this.vertices);
    }

    containsEdge(source, target) {
        if (source == null || target == null) throw new Error("Cannot contain edge adjacent to null data");
        let sourceVertex = this.vertices[source];
        let targetVertex = this.vertices[target];
        if (sourceVertex == null) return false;
        sourceVertex.edgesLeaving.forEach(e => {
            if (e.target == targetVertex)
                return true;
        })
        return false;
    }

    updateMasses() {
        let numVertices = Object.keys(this.vertices).length;
        let cumMassAvg = 1;
        // cycle thru all edges --> add weight to vertex's mass
        Object.values(this.vertices).forEach(v => {
            v.edgesLeaving.forEach(e => { // only adjust for target so vertices arent' double hit
                e.target.mass = e.target.mass + e.weight;
                cumMassAvg += e.weight/numVertices;
            })
        })
        // rescale all masses to have mean of 1
        Object.values(this.vertices).forEach(v => {
            v.mass = v.mass/cumMassAvg;
        })
    }

// psuedocode for drawing graph:

    // input: graph has initial layout p, threshold epsilon = when should we stop, k = max iterations (even if forces still large, we just stop eventually)
    // times = 1
    // while t < K, biggest force less than epsilon
    // how to get force in vertex?
        // get repulsive force between ALL vertices, attractive force between ADJACENT vertices
    // once we've computed force for ALL vertices, we apply the forces
        // i.e. position = position + delta * force on vertex
        // delta = cooling factor -- want it such that forces get lower as the number of iterations increase (like 1/t)

    /**
     * Updates the position values of all vertices using a force directed algorithm.
     * @param {*} c1 
     * @param {*} c2 
     * @param {*} c3 
     * @param {*} c4 
     */
    updatePositions(c1=1, c2=1, c3=1, c4=1) {
        const forces = {};
        // for all vertices, get force
        Object.values(this.vertices).forEach(v => {
            forces[v.data] = [0, 0];
            // get spring force with all adjacent vertices
            v.edgesLeaving.forEach(e => {
                if (v != e.target) {
                    forces[v.data] = arrayAdd(forces[v.data], v.springForce(e.target, c1, c2 - Math.sqrt(this.numEdges/(v.mass + e.target.mass))));
                }
            })
            // get repulsive force with ALL vertices 
            Object.values(this.vertices).forEach(v2 => {
                if (v2 != v) {
                    forces[v.data] = arrayAdd(forces[v.data], v.magnetForce(v2, c3), -1);
                }
            })
            
        })
        // for all vertices, apply force and then change position
        for (const [key, value] of Object.entries(forces)) {
            this.vertices[key].velocity = arrayAdd(this.vertices[key].velocity, value, c4 / this.vertices[key].mass);
            this.vertices[key].updatePosition();
        }
    }

    readPositions() {
        Object.values(this.vertices).forEach(v => {
            console.log(v.position);
        })
    }
}

class Vertex {
    constructor(data) {
        this.mass = 1; 
        // gives both values random number between -1, 1
        this.velocity = [0, 0]
        this.position = [(Math.random() * 200) - 100, (Math.random() * 200) - 100];
        this.data = data;
        this.edgesLeaving = [];
    }

    updatePosition() {
        // cap velocity first and apply drag
        for (let i = 0; i < 2; i++) {
            // apply drag
            this.velocity[i] = this.velocity[i] * 0.98;
            const mag = arrayMagnitude(this.velocity);
            if (mag > 5 * 60) setArrayMagnitude(this.velocity, 5 * 60);
        }
        this.position = arrayAdd(this.position, this.velocity, 1/60 * 1);
    }

    distance(vertex2) {
        return arrayAdd(vertex2.position, this.position, -1);
    }

    springForce(vertex2, c1, c2) {
        const distance = this.distance(vertex2);
        const mag = c1 * (arrayMagnitude(distance) - c2);
        setArrayMagnitude(distance, mag);
        return distance;
    }

    magnetForce(vertex2, c3) {
        // scale up force based on mass
        let distance = this.distance(vertex2);
        const mag = c3 * (this.mass * vertex2.mass/(arrayMagnitude(distance)**2));
        setArrayMagnitude(distance, mag);
        return distance;
    }
}

class Edge {
    constructor(target, weight) {
        this.target = target;
        this.weight = weight;
    }
}

function arrayMagnitude(arr) {
    let mag = 0;
    for (let i = 0; i < arr.length; i++) {
        mag += arr[i] ** 2;
    }
    return Math.sqrt(mag);
}

function setArrayMagnitude(arr, k) {
    let rescale = k/arrayMagnitude(arr);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i] * rescale;
    }
}

// taken from: https://love2dev.com/blog/javascript-remove-from-array/ 
function arrayRemove(arr, value) {
    return arr.filter(function (ele) {
        return ele != value;
    });
}

/**
 * Adds elements of two arrays together if they are the same length.
 * @param {*} arr1 
 * @param {*} arr2 
 * @param {*} c allows subtraction as well as adjusting entries of second array by constant
 */
function arrayAdd(arr1, arr2, c=1) {
    const ret = [];
    for (let i = 0; i < arr1.length; i++) {
        ret.push(arr1[i] + c*arr2[i]);
    }
    return ret;
}

function loadGraph(g_file) {
    let tg = new Graph();
    g_file.vertices.forEach(v => tg.insertVertex(v));
    g_file.edges.forEach(e => tg.insertEdge(e.source, e.target, e.weight));
    tg.updateMasses();
    return tg;
}