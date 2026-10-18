import type { Satellite } from "../../types/satellite/satellite";
import type { PropagateWorkerRequest } from "../../types/worker/propagateWorkerRequest";
import type { PropagateWorkerReturn } from "../../types/worker/propagateWorkerReturn";

export function createPropagateWrapper(onResult: (res: PropagateWorkerReturn) => void) {
  const worker = new Worker(
    new URL("./propagate.worker.ts", import.meta.url),
    {type: "module"},
  );

  worker.onmessage = (e: MessageEvent<PropagateWorkerReturn>) => onResult(e.data);

  return {
    send(request: PropagateWorkerRequest) {
      worker.postMessage(request);
    },
    terminate() {
      worker.terminate();
    }
  }
}
