// Ashima / Stefan Gustavson 3D simplex noise (MIT)
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform vec2 uPointer;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;
${noise}

float displace(vec3 p){
  float t = uTime * 0.18;
  float n = snoise(p * 0.95 + vec3(t, t * 0.7, -t * 0.5));
  n += 0.18 * snoise(p * 2.1 - vec3(t * 1.3));
  // A gentle bulge toward the pointer
  vec3 dir = normalize(vec3(uPointer * 0.9, 0.8));
  n += 0.45 * pow(max(dot(normalize(p), dir), 0.0), 3.0);
  return n * uAmp;
}

void main(){
  vec3 p = position;
  float d = displace(p);
  vec3 displaced = p + normal * d;

  // Recompute the normal from two neighbouring displaced points
  float e = 0.01;
  vec3 tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)) + vec3(0.0001));
  vec3 bitangent = normalize(cross(normal, tangent));
  vec3 p1 = p + tangent * e;
  vec3 p2 = p + bitangent * e;
  vec3 d1 = p1 + normalize(p1) * displace(p1);
  vec3 d2 = p2 + normalize(p2) * displace(p2);
  vec3 n = normalize(cross(d1 - displaced, d2 - displaced));

  vNormal = normalize(normalMatrix * n);
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  vView = normalize(-mv.xyz);
  vDisp = d;
  gl_Position = projectionMatrix * mv;
}
`

export const fragmentShader = /* glsl */ `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;

float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main(){
  vec3 n = normalize(vNormal);
  vec3 light = normalize(vec3(-0.55, 0.65, 0.55));
  float diff = max(dot(n, light), 0.0);
  float wrap = max((dot(n, light) + 0.35) / 1.35, 0.0);

  vec3 ink = vec3(0.078, 0.074, 0.070);   // ~#141312
  vec3 mid = vec3(0.204, 0.196, 0.184);   // ~#34322f
  vec3 bone = vec3(0.925, 0.902, 0.855);  // #ECE6DA
  vec3 clay = vec3(0.910, 0.584, 0.416);  // #E8956A

  vec3 col = mix(ink, mid, wrap);
  col = mix(col, bone * 0.62, pow(diff, 3.0) * 0.75);

  // Soft specular
  vec3 h = normalize(light + vView);
  col += bone * pow(max(dot(n, h), 0.0), 48.0) * 0.18;

  // Clay rim-light from behind-right
  float fres = pow(1.0 - max(dot(n, vView), 0.0), 3.0);
  float rimSide = smoothstep(-0.2, 0.8, dot(n, normalize(vec3(0.8, -0.2, -0.3))));
  col += clay * fres * (0.25 + 0.9 * rimSide);

  // Grain + dithering
  float g = hash(gl_FragCoord.xy + fract(uTime) * 100.0);
  col += (g - 0.5) * 0.06;

  gl_FragColor = vec4(col, 1.0);
}
`
