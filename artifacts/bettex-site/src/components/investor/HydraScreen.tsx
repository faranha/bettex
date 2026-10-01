import { hydraMessage } from './presentationData';
import './HydraScreen.css';

export function HydraScreen() {
  return (
    <div className="hydra-screen" data-testid="hydra-screen">
      <small className="hydra-screen__label">Seu perfil</small>
      <h5 className="hydra-screen__title">Protocolo Hydra</h5>
      <img className="hydra-screen__art" src={`${import.meta.env.BASE_URL}app/hydra-transparent.webp`} alt="" aria-hidden="true" width={600} height={600} decoding="async" />
      <p className="hydra-screen__opening">{hydraMessage.opening}</p>
      <div className="hydra-screen__rule" aria-hidden="true" />
      <p className="hydra-screen__attitude">{hydraMessage.attitude}</p>
      <strong className="hydra-screen__goal">{hydraMessage.goal}</strong>
    </div>
  );
}