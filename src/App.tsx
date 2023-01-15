import {useEffect, useRef} from 'react'
import {World} from "./world";
import {DebugHandler, ProductionHandler} from "./EnvironmentHandler";

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
      // Check if URL contains `/debug`:
      const debug = window.location.pathname.endsWith('/debug');
      const environmentHandler = (debug) ? new DebugHandler(document.body) : new ProductionHandler();
      const world = new World(environmentHandler, canvasRef.current!);
      return () => {
          world.close();
      }
  }, []);

  return (
  <canvas ref={canvasRef} className={"three"}></canvas>
)
}

export default App
