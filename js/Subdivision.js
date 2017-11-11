/** 
 * @author davidjourdan
 * Simple Loop subdivision scheme
*/

function subdivision(geometry, nbIterations=1){
    var hashMap = new Map();
    faces = [];

    // linear subdivision
    for(var f of geometry.faces){
        var e = [];
        [f.a, f.b, f.c].forEach(function(v, i, arr){
            var w = arr[(i+1)%3];
            // check if the edge has already been processed
            if(hashMap.has(w + ' ' + v)){
                e[i] = hashMap.get(w + ' ' + v);
            } else {
                // add vertex in the middle of the edge
                var vert = middleVert(geometry.vertices[v], geometry.vertices[w]);
                e[i] = geometry.vertices.push(vert) - 1;
                hashMap.set(v + ' ' + w, e[i]);
            }
        });
        faces.push(new THREE.Face3(f.a, e[0], e[2]));
        faces.push(new THREE.Face3(f.b, e[1], e[0]));
        faces.push(new THREE.Face3(f.c, e[2], e[1]));
        faces.push(new THREE.Face3(e[0], e[1], e[2]));
    }
    geometry.faces = faces;

    // averaging
    var valences = new Array(geometry.vertices.length).fill(0.0);
    var newVertices = [];
    for(var i=0; i<geometry.vertices.length; i++){
        newVertices[i] = new THREE.Vector3(0, 0, 0);
    }
    for(var f of geometry.faces){
        newVertices[f.a].add(centroid(geometry.vertices[f.a], geometry.vertices[f.b], geometry.vertices[f.c]));
        valences[f.a] += 1;
        newVertices[f.b].add(centroid(geometry.vertices[f.b], geometry.vertices[f.a], geometry.vertices[f.c]));
        valences[f.b] += 1;
        newVertices[f.c].add(centroid(geometry.vertices[f.c], geometry.vertices[f.b], geometry.vertices[f.a]));
        valences[f.c] += 1;
    }
    for(var i=0; i<geometry.vertices.length; i++){
    	newVertices[i].multiplyScalar(1/valences[i]);
    	if(valences[i] != 6){
    		newVertices[i] = correctVert(geometry.vertices[i], newVertices[i], valences[i]);
    	}
    }
    geometry.vertices = newVertices;
}   

// computes u = (v + w)/2
function middleVert(v, w){
    var u = new THREE.Vector3();
    u.x = 0.5*(v.x + w.x);
    u.y = 0.5*(v.y + w.y);
    u.z = 0.5*(v.z + w.z);
    return u;
}

// computes the centroid of the triangle, with weights 1/4, 3/8 and 3/8
function centroid(u, v ,w){
    var res = new THREE.Vector3();
    res.x = 1/4.*u.x + 3/8.*v.x + 3/8.*w.x;
    res.y = 1/4.*u.y + 3/8.*v.y + 3/8.*w.y;
    res.z = 1/4.*u.z + 3/8.*v.z + 3/8.*w.z;
    return res;
}

// corrects extraordinary vertices to have bounded curvature and C1 continuity
function correctVert(vert, newVert, valence){
    var weight = 5/3. - 8/3.*(3/8.+1/4.*Math.cos(2*Math.PI/valence))**2;
    newVert.x = vert.x + weight*(newVert.x - vert.x);
    newVert.y = vert.y + weight*(newVert.y - vert.y);
    newVert.z = vert.z + weight*(newVert.z - vert.z);
    return newVert;
}   