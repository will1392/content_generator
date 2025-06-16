import React, { useState, useEffect } from 'react';
import { User, Building2, Plus, Search, ChevronDown, Loader2 } from 'lucide-react';
import { Client } from '../../types/client.types';

interface ClientSelectorProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  onCreateClient: () => void;
  isLoading?: boolean;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  clients,
  selectedClient,
  onSelectClient,
  onCreateClient,
  isLoading
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState(clients);

  useEffect(() => {
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  return (
    <div className="relative">
      {/* Selected Client Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          {selectedClient ? (
            <>
              <div className="w-10 h-10 bg-[#533de3]/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-[#533de3]" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">{selectedClient.name}</p>
                {selectedClient.company && (
                  <p className="text-sm text-white/60">{selectedClient.company}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white/60" />
              </div>
              <p className="text-white/60">Select a client</p>
            </>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-50 overflow-hidden">
          {/* Search Bar */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#533de3]/50"
              />
            </div>
          </div>

          {/* Client List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#533de3] mx-auto" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-8 text-center text-white/60">
                {searchTerm ? 'No clients found' : 'No clients yet'}
              </div>
            ) : (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    onSelectClient(client);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-white/10 transition-colors ${
                    selectedClient?.id === client.id ? 'bg-[#533de3]/20' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-[#533de3]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-[#533de3]" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-white">{client.name}</p>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      {client.company && <span>{client.company}</span>}
                      {client.company && client.email && <span>•</span>}
                      {client.email && <span>{client.email}</span>}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Create New Client Button */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => {
                onCreateClient();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 p-3 bg-[#533de3] hover:bg-[#4531b8] rounded-xl text-white font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create New Client
            </button>
          </div>
        </div>
      )}
    </div>
  );
};