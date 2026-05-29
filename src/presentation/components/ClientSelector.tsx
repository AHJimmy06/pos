import { User } from "lucide-react";
import { useClients, type Client } from "../hooks/useClients";
import { usePOSStore } from "../store/usePOSStore";
import {
	DropdownSelector,
	type DropdownOption,
} from "@/components/ui/dropdown-selector";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ClientSelector: React.FC = () => {
	const { clients, isLoading } = useClients();
	const { selectedClient, setSelectedClient, clear } = usePOSStore();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const options: DropdownOption[] = (clients as any[]).map(
		(client: Client & { fullName?: string }) => ({
			id: client.id,
			label: client.fullName || `${client.firstName} ${client.lastName}`,
			description: "Cliente Activo",
			secondary: client.email,
		}),
	);

	const handleSelect = (option: DropdownOption) => {
		const client = (clients as any[]).find((c) => c.id === option.id);
		if (client) {
			setSelectedClient(client);
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const selected: DropdownOption | null = selectedClient
		? {
				id: selectedClient.id,
				label:
					(selectedClient as any).fullName ||
					`${selectedClient.firstName} ${selectedClient.lastName}`,
				description: "Cliente Activo",
				secondary: (selectedClient as any).email || selectedClient.email,
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
