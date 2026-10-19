import React from 'react';
import Panel from '../../../shared/ui/Panel';
import Badge from '../../../shared/ui/Badge';
import Button from '../../../shared/ui/Button';

export default function EstateAmenitiesPanel({
  profile,
  estateAmenities = [],
  onPurchaseAmenity,
  gold = 0,
  level = 1,
}) {
  const ownedAmenities = Array.isArray(profile?.estateAmenities) ? profile.estateAmenities : [];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <Panel variant="glass" className="border-yellow-700/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-500 font-bold">
              Estate Hearthcraft & Amenities
            </p>
            <h2 className="text-2xl font-bold text-white hero-title">Interior Furnishings & Relics</h2>
            <p className="mt-1 text-xs text-gray-300">
              Commission masterwork relics and hearthcraft amenities to empower your mining, agriculture, combat, and exploration.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-yellow-700/40 bg-gray-950/70 px-4 py-2 text-xs font-bold text-yellow-300">
              Installed: {ownedAmenities.length} / {estateAmenities.length}
            </span>
          </div>
        </div>

        {/* Active Buffs Summary */}
        {ownedAmenities.length > 0 && (
          <div className="mt-5 border-t border-gray-800/80 pt-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
              Cumulative Estate Buffs Active:
            </p>
            <div className="flex flex-wrap gap-2">
              {estateAmenities
                .filter((a) => ownedAmenities.includes(a.id))
                .map((amenity) => (
                  <span
                    key={amenity.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-300 shadow-sm"
                  >
                    <span>{amenity.icon}</span>
                    <span>{amenity.buff}</span>
                  </span>
                ))}
            </div>
          </div>
        )}
      </Panel>

      {/* Amenities Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {estateAmenities.map((amenity) => {
          const isInstalled = ownedAmenities.includes(amenity.id);
          const meetsLevel = level >= amenity.levelRequired;
          const canAfford = gold >= amenity.price;
          const isLocked = !isInstalled && (!meetsLevel || !canAfford);

          return (
            <Panel
              key={amenity.id}
              variant="default"
              className={`flex flex-col justify-between transition-all duration-200 ${
                isInstalled
                  ? 'border-yellow-500/40 bg-yellow-950/10 shadow-[0_0_15px_rgba(234,179,8,0.06)]'
                  : 'hover:border-yellow-700/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-700/30 bg-gray-900/80 text-xl shadow-inner">
                    {amenity.icon}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="subtle" className="text-[10px]">
                      {amenity.category}
                    </Badge>
                    {isInstalled ? (
                      <Badge variant="success">Installed ✓</Badge>
                    ) : (
                      <span className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-2 py-0.5 text-[11px] font-bold text-yellow-300">
                        {amenity.price}g
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white">{amenity.name}</h3>
                <p className="mt-1 text-xs text-yellow-300 font-semibold">{amenity.buff}</p>
                <p className="mt-2 text-xs text-gray-400 leading-relaxed italic border-l border-yellow-700/20 pl-2">
                  "{amenity.description}"
                </p>
              </div>

              <div className="mt-5 border-t border-gray-800/80 pt-3">
                {isInstalled ? (
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
                    <span>Active Estate Perk</span>
                    <span>Empowered</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] text-gray-400">
                      {!meetsLevel && <span>Requires Lvl {amenity.levelRequired}</span>}
                      {meetsLevel && !canAfford && <span>Need {amenity.price - gold}g more</span>}
                      {meetsLevel && canAfford && <span>Ready to Commission</span>}
                    </div>

                    <Button
                      variant={isLocked ? 'ghost' : 'primary'}
                      disabled={isLocked}
                      onClick={() => onPurchaseAmenity(amenity)}
                      className="text-xs px-3 py-1.5 font-bold"
                    >
                      Commission
                    </Button>
                  </div>
                )}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
