import * as stylex from '@stylexjs/stylex';
import { Button } from '../ui/components';
import { s } from '../ui/styles';

export function CreationRecovery({ checking, verified, reconcile, startNew, href, label }: { checking: boolean; verified: boolean; reconcile: () => Promise<void>; startNew: () => void; href: string; label: string }) {
  return <div {...stylex.props(s.notice, s.tight)}><p>O resultado é incerto. Consulte os registros e confira se a criação aparece. Nenhum envio será repetido automaticamente.</p><div {...stylex.props(s.row)}><Button secondary disabled={checking} onClick={() => void reconcile()}>{checking ? 'Consultando…' : 'Consultar registros salvos'}</Button><a href={href} {...stylex.props(s.link)}>Ver {label} →</a></div>{verified && <><p>Consulta concluída. Confira a lista e aguarde se o servidor ainda estiver processando a criação.</p><Button secondary onClick={startNew}>Conferi os registros; preparar nova criação</Button></>}</div>;
}
