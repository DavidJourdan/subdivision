#define INV_PI 0.31830988618379067153776752674503

varying vec3 n; // fragment-wise normal
varying vec3 p; // fragment-wise position

uniform vec3 color;
uniform vec3 lightPos;
uniform vec3 cameraPos;

const vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
const vec4 white = vec4(1.0, 1.0, 1.0, 1.0);

void main (void) {
    gl_FragColor = vec4(color, 1.0);

    vec3 l = normalize (lightPos - p);
    vec3 v = normalize (cameraPos - p);

    if(dot(n, l)>0.0) gl_FragColor = vec4(0.5*color, 1.0);
    else if(dot(n, -v)>0.99) gl_FragColor = white;
}
