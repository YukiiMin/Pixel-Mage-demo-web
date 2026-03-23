import { ShieldCheck } from "lucide-react";

export function DropRateTable() {
	return (
		<div className="mb-4" data-testid="drop-rate-table">
			<div className="mb-2 flex items-center justify-between">
				<h4 className="text-sm font-semibold text-foreground">
					Tỉ lệ nhận thẻ
				</h4>
				<span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500 ring-1 ring-inset ring-amber-500/20">
					<ShieldCheck className="h-3 w-3" />
					Phase 2: tỉ lệ từ API
				</span>
			</div>

			<div className="overflow-hidden rounded-md border border-border/40">
				<table className="w-full text-left text-xs">
					<thead className="bg-muted/50 text-muted-foreground">
						<tr>
							<th className="px-3 py-2 font-medium">Slot</th>
							<th className="px-3 py-2 font-medium">COMMON</th>
							<th className="px-3 py-2 font-medium text-purple-400">RARE</th>
							<th className="px-3 py-2 font-medium text-amber-400">
								LEGENDARY
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border/40 bg-card/50">
						<tr>
							<td className="px-3 py-2">1-3</td>
							<td className="px-3 py-2 text-foreground">100%</td>
							<td className="px-3 py-2 text-muted-foreground">—</td>
							<td className="px-3 py-2 text-muted-foreground">—</td>
						</tr>
						<tr>
							<td className="px-3 py-2">4</td>
							<td className="px-3 py-2 text-foreground">70%</td>
							<td className="px-3 py-2 text-purple-300">30%</td>
							<td className="px-3 py-2 text-muted-foreground">—</td>
						</tr>
						<tr>
							<td className="px-3 py-2">5</td>
							<td className="px-3 py-2 text-muted-foreground">—</td>
							<td className="px-3 py-2 text-purple-300">80%</td>
							<td className="px-3 py-2 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] font-medium">
								20% ✦
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
