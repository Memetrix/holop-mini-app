/**
 * HOLOP — Animated Water Shader Filter
 * PixiJS v8 custom filter that adds flowing water animation
 * with ripple distortion and shimmer effects.
 */

import { Filter, GlProgram } from 'pixi.js';

// ─── GLSL Fragment Shader ───

const WATER_FRAG = /* glsl */ `
precision mediump float;

in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform float uTime;

void main() {
  vec2 uv = vTextureCoord;

  // Two scrolling wave layers for organic water movement
  float wave1 = sin(uv.x * 25.0 + uTime * 0.7) * 0.003;
  float wave2 = sin(uv.y * 18.0 - uTime * 0.5 + uv.x * 8.0) * 0.002;
  float wave3 = sin((uv.x + uv.y) * 12.0 + uTime * 0.3) * 0.0015;

  // Distort UVs for flowing effect
  vec2 distortedUV = uv + vec2(wave1 + wave3, wave2 + wave3);

  // Sample the texture
  vec4 color = texture(uTexture, distortedUV);

  // Add subtle shimmer (specular highlights)
  float shimmer = sin(uv.x * 40.0 + uv.y * 30.0 + uTime * 2.5) * 0.5 + 0.5;
  shimmer *= sin(uv.x * 15.0 - uTime * 1.2) * 0.5 + 0.5;
  shimmer = pow(shimmer, 4.0) * 0.08; // sharp, sparse highlights

  color.rgb += vec3(shimmer * 0.5, shimmer * 0.6, shimmer);

  // Slight blue tint pulse
  float pulse = sin(uTime * 0.4) * 0.01 + 0.99;
  color.b *= pulse + 0.02;

  finalColor = color;
}
`;

const WATER_VERT = /* glsl */ `
in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition(void) {
  vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
  position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
  position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
  return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(void) {
  return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void) {
  gl_Position = filterVertexPosition();
  vTextureCoord = filterTextureCoord();
}
`;

// ─── Filter Factory ───

export function createWaterFilter(): Filter {
  const glProgram = GlProgram.from({
    vertex: WATER_VERT,
    fragment: WATER_FRAG,
  });

  return new Filter({
    glProgram,
    resources: {
      waterUniforms: {
        uTime: { value: 0, type: 'f32' },
      },
    },
  });
}

// ─── Update helper ───

export function updateWaterFilter(filter: Filter, deltaTime: number): void {
  const uniforms = (filter.resources as Record<string, { uniforms: { uTime: number } }>).waterUniforms?.uniforms;
  if (uniforms) {
    uniforms.uTime += 0.03 * deltaTime;
  }
}
