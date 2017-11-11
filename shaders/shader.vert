    varying vec3 n;
    varying vec3 p;
    void main(void) {
        n = normal;
        p = vec3(modelViewMatrix * vec4 (position, 1.0));
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
