export {};

type ModelContextTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute: (input: Record<string, unknown>, client: unknown) => Promise<unknown> | unknown;
  annotations?: {
    readOnlyHint?: boolean;
  };
};

type ModelContextRegisterToolOptions = {
  signal?: AbortSignal;
};

declare global {
  interface Navigator {
    modelContext?: {
      registerTool: (tool: ModelContextTool, options?: ModelContextRegisterToolOptions) => void;
    };
  }
}
