// === GenericTable (Deprecated Wrapper) ===
// Este wrapper existe solo para evitar rompimientos inmediatos tras la fusión.
// Reemplazar imports que usan GenericTable por `Table` con prop `responsive`.
// Luego eliminar este archivo.
import { Table } from "./Table";

export const GenericTable = (props) => <Table responsive {...props} />;
