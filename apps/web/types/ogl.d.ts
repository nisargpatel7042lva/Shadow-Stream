declare module 'ogl' {
  export interface RendererOptions {
    dpr?: number;
    alpha?: boolean;
    antialias?: boolean;
  }

  export interface OGLRenderingContext extends WebGLRenderingContext {
    canvas: HTMLCanvasElement;
  }

  export class Renderer {
    gl: OGLRenderingContext;
    constructor(options?: RendererOptions);
    setSize(width: number, height: number): void;
    render(options: { scene: Mesh }): void;
  }

  export class Triangle {
    constructor(gl: OGLRenderingContext);
  }

  export interface ProgramUniform {
    value: number | number[] | Float32Array | Int32Array;
  }

  export interface ProgramUniforms {
    [key: string]: ProgramUniform;
  }

  export interface ProgramOptions {
    vertex: string;
    fragment: string;
    uniforms?: ProgramUniforms;
  }

  export class Program {
    uniforms: ProgramUniforms;
    constructor(gl: OGLRenderingContext, options: ProgramOptions);
  }

  export interface MeshOptions {
    geometry: Triangle;
    program: Program;
  }

  export class Mesh {
    constructor(gl: OGLRenderingContext, options: MeshOptions);
  }
}
