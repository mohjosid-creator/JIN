/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AvatarState = 
  | 'HIDDEN'
  | 'APPEARING'
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'SPEAKING'
  | 'DISAPPEARING';

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  avatarState?: AvatarState;
  thoughtProcess?: string;
  analysisTriggered?: boolean;
  analysisResult?: DataAnalysisResult;
  memoryStored?: boolean;
  isStreaming?: boolean;
  source?: 'web' | 'whatsapp' | 'instagram' | 'meta';
  senderName?: string;
}

export interface MetaMessage {
  id: string;
  sender: string;
  senderName: string;
  channel: 'whatsapp' | 'instagram' | 'messenger';
  message: string;
  aiResponse?: string;
  status: 'received' | 'processing' | 'replied' | 'delivered';
  timestamp: string;
  latencyMs?: number;
}

export interface MetaConfig {
  phoneNumberId: string;
  wabaId: string;
  verifyToken: string;
  autoReply: boolean;
  webhookUrl: string;
  status: 'CONNECTED' | 'STANDBY' | 'SIMULATED';
  authorizedOwnerPhone: string;
  channels: {
    whatsapp: boolean;
    instagram: boolean;
    messenger: boolean;
  };
}

export interface OllamaConfig {
  endpoint: string;
  selectedModel: string;
  status: 'ONLINE' | 'CONNECTED' | 'EMBEDDED_LOCAL' | 'OFFLINE_READY';
  offlineModeActive: boolean;
  localModelLoaded: boolean;
  modelsAvailable: string[];
  offlineMemoryCount: number;
}

export interface ExternalAiService {
  id: 'ollama' | 'canva' | 'suno' | 'google_flow';
  name: string;
  provider: string;
  category: 'Local LLM Engine' | 'Creative Design' | 'Audio & Music' | 'Automated Workflow';
  status: 'ACTIVE' | 'CONNECTED' | 'OFFLINE_READY';
  description: string;
  iconType: string;
  capabilities: string[];
  lastResult?: string;
  offlineSupport: boolean;
}

export interface OfflineKnowledgeItem {
  id: string;
  title: string;
  category: 'business_strategy' | 'technical_architecture' | 'client_qa' | 'workflow_automation';
  summary: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface AiTaskResult {
  serviceId: string;
  serviceName: string;
  taskType: string;
  status: 'SUCCESS' | 'GENERATED' | 'OFFLINE_CACHED';
  title: string;
  outputSummary: string;
  payload: Record<string, any>;
  timestamp: string;
}

export interface DataAnalysisResult {
  datasetName: string;
  rowCount: number;
  columns: string[];
  metrics: Record<string, number | string>;
  anomaliesDetected: number;
  executionTimeMs: number;
  stdoutLogs: string[];
  chartData: {
    labels: string[];
    series: { name: string; values: number[]; color?: string }[];
  };
  summaryText: string;
}

export interface VectorMemoryEntry {
  id: string;
  title: string;
  content: string;
  category: 'conversation' | 'data_insight' | 'system_rule' | 'architecture';
  vectorPreview: number[];
  similarity?: number;
  createdAt: string;
}

export interface PipelineLog {
  id: string;
  timestamp: string;
  stage: 'GATEWAY' | 'AVATAR_SYNC' | 'LLM_INFERENCE' | 'PYTHON_WORKER' | 'VECTOR_DB' | 'MULTIMEDIA' | 'DOCUMENTS' | 'WEBHOOK_BUS' | 'LOCAL_RAG' | 'EDGE_AI' | 'OMNICHANNEL' | 'FINANCIAL_SQL';
  message: string;
  level: 'info' | 'success' | 'warn';
  durationMs?: number;
}

// 1. Multimedia Pipeline Types
export type MediaTaskFsmState =
  | 'PENDING'
  | 'PROCESSING'
  | 'VENDOR_DISPATCHED'
  | 'POLLING'
  | 'COMPLETED'
  | 'FAILED'
  | 'WEBHOOK_NOTIFIED';

export interface MultimediaTask {
  id: string;
  type: 'video' | 'audio' | 'visual' | 'dag_composite';
  targetApi: 'runway' | 'pika' | 'elevenlabs' | 'midjourney' | 'dalle3';
  prompt: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  fsmState?: MediaTaskFsmState;
  emotionalTone?: 'enthusiastic' | 'authoritative' | 'calm' | 'urgent' | 'empathetic';
  voiceId?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  quality?: 'standard' | 'hd' | 'ultra_4k';
  resultUrl?: string;
  durationSeconds?: number;
  progressPercent: number;
  retryCount: number;
  circuitBreakerState?: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  lockAcquired?: boolean;
  tokenBucketCost?: number;
  createdAt: string;
  completedAt?: string;
}

export interface CircuitBreakerStatus {
  vendor: 'runway' | 'elevenlabs' | 'midjourney' | 'pika' | 'dalle3';
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  failureThreshold: number;
  recoveryTimeoutSec: number;
  lastFailureTime?: string;
  consecutiveSuccesses: number;
}

export interface TokenBucketStatus {
  vendor: string;
  tokensRemaining: number;
  bucketCapacity: number;
  refillRatePerSec: number;
  costPerRequest: number;
  lastRefillTime: string;
}

export interface DeadLetterQueueItem {
  id: string;
  taskId: string;
  vendor: string;
  mediaType: string;
  errorType: 'VendorRateLimitError' | 'VendorOutageError' | 'PayloadValidationError' | 'CircuitBreakerOpenError';
  errorMessage: string;
  retryCount: number;
  timestamp: string;
  promptPayload: string;
  canRetry: boolean;
}

export interface EmotionalVadVector {
  valence: number; // -1.0 (negative) to 1.0 (positive)
  arousal: number; // 0.0 (calm) to 1.0 (excited)
  dominance: number; // 0.0 (submissive) to 1.0 (dominant/commanding)
  toneName: string;
  elevenLabsSettings: {
    stability: number; // 0.0 to 1.0
    similarity_boost: number; // 0.0 to 1.0
    style: number; // 0.0 to 1.0
    use_speaker_boost: boolean;
  };
}

export interface DagPipelineNode {
  id: string;
  name: string;
  service: 'elevenlabs' | 'midjourney' | 'runway';
  type: 'audio' | 'visual' | 'video';
  dependencies: string[];
  status: MediaTaskFsmState;
  progress: number;
  outputArtifact?: string;
  executionDurationMs?: number;
}

export interface PromptSanitizationResult {
  originalPrompt: string;
  sanitizedPrompt: string;
  isSafe: boolean;
  detectedCategories: string[];
  threatScore: number; // 0.0 to 1.0
  redactedTokensCount: number;
}

export type CommandDeckViewMode = 'standard_split' | 'spatial_hologram' | 'pip_floating';


// 2. Enterprise Document Types
export interface EnterpriseDocument {
  id: string;
  title: string;
  format: 'google_sheets' | 'google_slides' | 'google_docs' | 'ms_excel' | 'ms_powerpoint';
  templateType: 'financial_quarterly' | 'executive_deck' | 'sop_governance';
  generatedFormulas?: string[];
  slideCount?: number;
  rowCount?: number;
  authMethod: 'OAuth2_PKCE' | 'Service_Account_JWT';
  rbacRole: 'OWNER' | 'EDITOR' | 'VIEWER';
  status: 'READY' | 'SYNCED_CLOUD' | 'DRAFT';
  downloadUrl?: string;
  createdAt: string;
}

// 3. Webhook & Agentic Workflow Types (n8n & Make.com)
export interface WorkflowEvent {
  id: string;
  eventName: string;
  source: 'whatsapp_inbound' | 'telemetry_anomaly' | 'client_order' | 'jin_agent';
  destinationUrl: string;
  targetPlatform: 'n8n' | 'make_com' | 'redis_pubsub';
  hmacSignature: string;
  verified: boolean;
  status: 'DELIVERED' | 'FAILED' | 'RETRYING';
  payload: Record<string, any>;
  timestamp: string;
}

// 4. Local Offline RAG Types (LanceDB / ChromaDB)
export interface LocalRagDoc {
  id: string;
  title: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'csv';
  chunkCount: number;
  totalTokens: number;
  denseVectorDim: number;
  bm25Indexed: boolean;
  ingestedAt: string;
  contentPreview: string;
}

export interface RagQueryResult {
  query: string;
  executionTimeMs: number;
  retrievedChunks: {
    docId: string;
    docTitle: string;
    text: string;
    denseScore: number;
    bm25Score: number;
    hybridScore: number;
    rank: number;
  }[];
}

// 5. LLM Fine-Tuning & Ollama Modelfile Types
export interface FineTuneConfig {
  baseModel: 'llama3:8b' | 'mistral:7b' | 'qwen2.5:7b';
  datasetRows: number;
  technique: 'QLoRA_4bit' | 'LoRA_16bit';
  loraRank: number;
  loraAlpha: number;
  epochs: number;
  learningRate: number;
  targetModules: string[];
  modelfileContent: string;
  customPersona: string;
  status: 'IDLE' | 'TRAINING' | 'EXPORTED_GGUF' | 'DEPLOYED_OLLAMA';
}

// 6. Edge Vision & Whisper.cpp Types
export interface EdgeAiStatus {
  whisperCppStatus: 'READY' | 'TRANSCRIBING' | 'IDLE';
  whisperModel: 'whisper.cpp-small-q5_1' | 'whisper.cpp-medium';
  vadActive: boolean;
  llavaVisionStatus: 'READY' | 'INSPECTING' | 'IDLE';
  llavaModel: 'llava:7b-q4_k' | 'moondream2';
  vramAllocatedMb: number;
  vramTotalMb: number;
  ramUsageMb: number;
  deviceBackend: 'Metal_MPS' | 'CUDA' | 'CPU_AVX2';
}

// 7. Omni-Channel E-Commerce Types
export interface OmniChannelMessage {
  id: string;
  channel: 'telegram' | 'tiktok_shop' | 'tokopedia' | 'shopee' | 'whatsapp' | 'instagram';
  customerName: string;
  customerHandle: string;
  rawText: string;
  standardizedIntent: 'order_inquiry' | 'product_spec' | 'complaint' | 'payment_confirmation';
  aiReplyText?: string;
  sentiment: 'positive' | 'neutral' | 'urgent';
  rateLimitTokensLeft: number;
  timestamp: string;
}

// 8. Financial SQL & Anomaly Types
export interface FinancialAnomalyRecord {
  id: string;
  txId: string;
  vendor: string;
  category: string;
  amount: number;
  anomalyScore: number;
  zScore: number;
  flagReason: string;
  isFlagged: boolean;
  date: string;
}

export interface TextToSqlResult {
  naturalQuery: string;
  generatedSql: string;
  isReadOnlySafe: boolean;
  executionTimeMs: number;
  rowsReturned: number;
  columns: string[];
  rows: Record<string, any>[];
}

// 9. Audio-Reactive Viseme & Emotion Types
export interface VisemeState {
  viseme_aa: number; // Open mouth / Ah
  viseme_ee: number; // Smile / Ee
  viseme_ih: number; // Teeth / Ih
  viseme_oh: number; // Round / Oh
  viseme_ou: number; // Small circle / Ou
  viseme_pp: number; // Closed lips / P, B, M
  emotion_joy: number;
  emotion_thoughtful: number;
  emotion_alert: number;
  audioAmplitude: number;
  frequencyBandHz: number;
}

// 10. WebXR Spatial Engine Types
export interface WebXrSpatialState {
  sessionActive: boolean;
  mode: 'none' | 'immersive-ar' | 'immersive-vr';
  planeDetected: boolean;
  anchorPlaced: boolean;
  anchorCoordinates: { x: number; y: number; z: number };
  positionalAudioActive: boolean;
  distanceAttenuation: number;
  floatingPanelsVisible: boolean;
}
// 11. Planetary-Scale Heterogeneous Multi-Model Neural Fabric Types
export type NeuralModelId = 
  | 'deepseek-v4.1-flash'
  | 'gemma-4-edge'
  | 'glm-5.2-miniax'
  | 'llama-3.3-generative'
  | 'qwen-2.5-math'
  | 'gemini-3.8-flash';

export interface NeuralModelSpec {
  id: NeuralModelId;
  name: string;
  specialty: string;
  provider: 'DeepSeek AI' | 'Google DeepMind' | 'Zhipu GLM' | 'Meta AI' | 'Alibaba Qwen' | 'Google Cloud';
  roleDescription: string;
  latencyBudgetMs: number;
  tokensPerSec: number;
  status: 'ACTIVE' | 'STANDBY' | 'OFFLINE_READY';
  weight: number;
}

export interface NeuralRoutingDecision {
  query: string;
  tokenComplexity: number; // 1 - 10
  domainSpecificity: 'CODE_MATH' | 'FAST_REASONING' | 'EDGE_OFFLINE' | 'MULTILINGUAL_DOCS' | 'CREATIVE_SYNTHESIS' | 'ENTERPRISE_COMMAND';
  selectedModel: NeuralModelId;
  fallbackModel: NeuralModelId;
  consensusModels: NeuralModelId[];
  latencyBudgetMs: number;
  reasoning: string;
  timestamp: string;
}

export interface AiPowerStatus {
  state: 'ONLINE' | 'STANDBY' | 'DEACTIVATED';
  powerAuthorized: boolean;
  authorizedOwner: string; // 'Mas Joe (@mohjosid)'
  lastCommand: string;
  updatedAt: string;
}
