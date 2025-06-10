"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, Flame, Zap, CloudRain, Waves, Mountain } from "lucide-react"

interface Hotspot {
    Country: string
    Region: string
    Num_Occurences: number
    TotalImpactScore: number
    Rank: number
}

const disasterTypes = [
    { key: "earthquake", label: "Earthquake", icon: Zap },
    { key: "wildfire", label: "Wildfire", icon: Flame },
    { key: "flood", label: "Flood", icon: Waves },
    { key: "storm", label: "Storm", icon: CloudRain },
    { key: "volcanic_activity", label: "Volcanic Activity", icon: Mountain },
]

export function HotspotsTab() {
    const [selectedType, setSelectedType] = useState<string>(disasterTypes[0].key)
    const [sortBy, setSortBy] = useState<keyof Hotspot>("Rank")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const [hotspots, setHotspots] = useState<Hotspot[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchHotspots = async () => {
            setLoading(true)
            setError(null)
            try {
                const endpoint = selectedType === "volcanic_activity" ? "volcanohotspots" :
                    selectedType === "wildfire" ? "firehotspots" :
                        `${selectedType}hotspots`
                const response = await fetch(`http://localhost:5001/${endpoint}`)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                const data = await response.json()
                setHotspots(data.results)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch hotspots")
            } finally {
                setLoading(false)
            }
        }

        fetchHotspots()
    }, [selectedType])

    const sortedHotspots = [...hotspots].sort((a, b) => {
        let aValue = a[sortBy]
        let bValue = b[sortBy]
        if (typeof aValue === "string" && typeof bValue === "string") {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
        }
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
    })

    const handleSort = (column: keyof Hotspot) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortBy(column)
            setSortDirection("asc")
        }
    }

    const Icon = disasterTypes.find(dt => dt.key === selectedType)?.icon

    return (
        <TabsContent value="hotspots">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-6 w-6 text-orange-500" />}
                        <div>
                            <CardTitle className="text-2xl">Disaster Hotspots</CardTitle>
                            <CardDescription className="mt-1.5">
                                Top 5 regions per disaster type, ranked by frequency and impact
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
                        <TabsList className="mb-4 grid grid-cols-5 gap-2">
                            {disasterTypes.map(dt => (
                                <TabsTrigger key={dt.key} value={dt.key} className="flex items-center gap-2">
                                    <dt.icon className="h-4 w-4" />
                                    {dt.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <div className="rounded-lg border border-gray-200 bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead onClick={() => handleSort("Rank")} className="cursor-pointer select-none text-center">
                                        Rank
                                        {sortBy === "Rank" && (sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort("Country")} className="cursor-pointer select-none text-center">
                                        Country
                                        {sortBy === "Country" && (sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort("Region")} className="cursor-pointer select-none text-center">
                                        Region
                                        {sortBy === "Region" && (sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort("Num_Occurences")} className="cursor-pointer select-none text-center">
                                        # Occurrences
                                        {sortBy === "Num_Occurences" && (sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort("TotalImpactScore")} className="cursor-pointer select-none text-center">
                                        Total Impact Score
                                        {sortBy === "TotalImpactScore" && (sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                            Loading hotspots...
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-red-500 py-8">
                                            {error}
                                        </TableCell>
                                    </TableRow>
                                ) : sortedHotspots.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                            No hotspots found for this disaster type.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedHotspots.map((hotspot) => (
                                        <TableRow key={hotspot.Rank} className="hover:bg-gray-50">
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-bold">
                                                    {hotspot.Rank}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">{hotspot.Country}</TableCell>
                                            <TableCell className="text-center">{hotspot.Region}</TableCell>
                                            <TableCell className="text-center font-medium">{hotspot.Num_Occurences}</TableCell>
                                            <TableCell className="text-center font-medium">{hotspot.TotalImpactScore.toLocaleString(undefined, { maximumFractionDigits: 1 })}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    )
} 