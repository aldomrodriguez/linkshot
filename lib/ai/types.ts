export interface AIProvider {
  name: string;
  call(prompt: string): Promise<string>;
}

export interface Palette {
  nombre: string;
  color1: string;
  color2: string;
}

export interface AIResponse {
  titulo: string;
  descripcion: string;
  paletas: Palette[];
}
