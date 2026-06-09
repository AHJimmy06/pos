import { User } from "lucide-react";
import { useClients } from "../hooks/useClients";
import { usePOSStore } from "../store/usePOSStore";
import {
	DropdownSelector,
	type DropdownOption,
} from "@/components/ui/dropdown-selector";

export const ClientSelector: React.FC = () => {
	const { clients, isLoading } = useClients();
	const { selectedClient, setSelectedClient, clear } = usePOSStore();

	const options: DropdownOption[] = clients.map((client) => ({
		id: client.id,
		label: client.fullName,
		description: "Cliente Activo",
		secondary: client.email,
	}));

	const handleSelect = (option: DropdownOption) => {
		const client = clients.find((c) => c.id === option.id);
		if (client) {
			setSelectedClient(client);
		}
	};

	const selected: DropdownOption | null = selectedClient
		? {
				id: selectedClient.id,
				label: selectedClient.fullName,
				description: "Cliente Activo",
				secondary: selectedClient.email,
			}
		: null;

	return (
		<DropdownSelector
			options={options}
			selected={selected}
			onSelect={handleSelect}
			onClear={clear}
			placeholder="Seleccionar Cliente..."
			searchPlaceholder="Buscar cliente por nombre o ID..."
			emptyMessage="No se encontraron clientes"
			triggerIcon={<User className="size-5" />}
			isLoading={isLoading}
			triggerHeight="md"
		/>
	);
};
