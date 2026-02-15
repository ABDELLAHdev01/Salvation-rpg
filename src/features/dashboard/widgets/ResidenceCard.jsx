import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import SectionHeader from '../../../shared/ui/SectionHeader';
import Badge from '../../../shared/ui/Badge';
import Button from '../../../shared/ui/Button';

const ResidenceCard = ({ activeHouse }) => {
    return (
        <Panel variant="ornament" className="hover-lift">
            <SectionHeader kicker="Real Estate" title="Residence" />
            <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-yellow-700/30 bg-gray-950/80 shadow-inner group">
                <img
                    src={activeHouse?.image || '/houses/house_1.png'}
                    alt={activeHouse?.name || 'Residence'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            </div>
            <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Vibe</span>
                    <Badge variant="gold">{activeHouse?.tier || 'Tier 1'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Comfort</span>
                    <Badge variant="info">{activeHouse?.effect?.name || 'Rested Comfort'}</Badge>
                </div>
            </div>
            <Button variant="ghost" to="/housing" className="mt-6 w-full text-[11px] uppercase tracking-widest">
                Manage Property
            </Button>
        </Panel>
    );
};

export default memo(ResidenceCard);
