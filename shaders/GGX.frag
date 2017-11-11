#define INV_PI 0.31830988618379067153776752674503

const float roughness = 0.2; // alpha^2
/*const float k = sqrt(2.0*roughness*INV_PI);*/
const float f0 = 0.5;
const float diffuse_color = 0.3;

varying vec4 P; // fragment-wise position
varying vec3 N; // fragment-wise normal
varying vec4 C; // fragment-wise color

// attenuation function
float att(float d) {
    float a = 0.05;
    float b = 0.01;
    return 1.0/(1.0+a*d+b*d*d);
}

// Schlick approximation for computing the geometrical GGX term
float g1(float dot_w_n) {
    float k = sqrt(2.0*roughness*INV_PI);
    return 1.0/(dot_w_n*(1.0-k)+k);
}

// GGX micro-facet distribution
float d_GGX(float dot_n_h) {
    float a = roughness*INV_PI;
    float b = 1.0 + (roughness - 1.0)*dot_n_h*dot_n_h;
    return a/(b*b);
}

void main (void) {
    gl_FragColor = vec4 (0.05, 0.05, 0.05, 1.0);
    if(C.w < 0.0) {
        gl_FragColor += C*0.02*C.w;
        gl_FragColor.w = 1.0;
    } else {
            vec3 p = vec3 (gl_ModelViewMatrix * P);
            vec3 n = normalize (gl_NormalMatrix * N);
            vec3 l = normalize (gl_LightSource[0].position.xyz - p); // omega_i
            float d = length(p);
            vec3 v = normalize (-p); //omega_0

            float dot_l_n = dot(l, n);
            if(dot_l_n > 0.0) {
                vec3 h = normalize(l + v); // omega_h
                float dot_l_h = dot(l, h);
                float dot_n_h = max(dot(n, h), 0.0);

                // Fresnel term, optimized to prevent it from calling pow() too much
                float f = (dot_l_h > 0.0) ? f0 + (1.0 - f0)*pow(1.0 - dot_l_h, 5.0) : 1.0;

                float g = g1(max(dot(l, n), 0.0))*g1(max(dot(v, n), 0.0));
                float specular = d_GGX(dot_n_h)*f*g;
                gl_FragColor += C*att(d)*(diffuse_color*gl_LightSource[0].diffuse + specular*gl_LightSource[0].specular)*dot_l_n*C.w;

                //clamp lit fragment so that there isn't a discontinuity between lit and non-lit fragments
                gl_FragColor.x = max(gl_FragColor.x, 0.05*C.x*C.w);
                gl_FragColor.z = max(gl_FragColor.z, 0.05*C.z*C.w);
                gl_FragColor.y = max(gl_FragColor.y, 0.05*C.y*C.w);
                gl_FragColor.w = 1.0;
            }
    }
}