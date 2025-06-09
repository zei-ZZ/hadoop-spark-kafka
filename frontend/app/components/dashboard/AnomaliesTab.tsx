"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, ChangeEvent, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

// Types for our mock data
interface AnomalyEvent {
    id: string
    eventName: string
    disasterType: string
    country: string
    date: string
    lastUpdated: string
    magnitude: number | null
    deaths: number | null
    affected: number | null
    anomalyType: "magnitude" | "deaths" | "affected"
    source: string
    coordinates: [number, number]
}

export function AnomaliesTab() {
    // State for anomalies tab
    const [selectedDisasterType, setSelectedDisasterType] = useState<string>("all")
    const [yearRange, setYearRange] = useState<{ start: string; end: string }>({ start: "", end: "" })
    const [selectedAnomalyType, setSelectedAnomalyType] = useState<string>("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [showFilters, setShowFilters] = useState(true)
    const itemsPerPage = 10
    const [sortBy, setSortBy] = useState<keyof AnomalyEvent | null>(null)
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const [anomalies, setAnomalies] = useState<any[]>([])
    const [pagination, setPagination] = useState<{ page: number; page_size: number; total: number; total_pages: number }>({ page: 1, page_size: 10, total: 0, total_pages: 0 })

    useEffect(() => {
        const fetchAnomalies = async () => {
            const queryParams = new URLSearchParams()
            if (selectedDisasterType !== "all") {
                queryParams.append("disaster_type", selectedDisasterType)
            }
            if (selectedAnomalyType !== "all") {
                queryParams.append("anomaly_type", selectedAnomalyType)
            }
            if (yearRange.start) {
                queryParams.append("start_year", yearRange.start)
            }
            if (yearRange.end) {
                queryParams.append("end_year", yearRange.end)
            }
            queryParams.append("page", currentPage.toString())
            queryParams.append("page_size", itemsPerPage.toString())

            const response = await fetch(`http://localhost:5001/anomalies?${queryParams}`)
            const data = await response.json()
            setAnomalies(data.results || [])
            setPagination(data.pagination || { page: 1, page_size: 10, total: 0, total_pages: 0 })
        }

        fetchAnomalies()
    }, [selectedDisasterType, selectedAnomalyType, yearRange, currentPage, itemsPerPage])

    const handleYearChange = (field: 'start' | 'end') => (e: ChangeEvent<HTMLInputElement>) => {
        setYearRange(prev => ({ ...prev, [field]: e.target.value }))
    }

    const getAnomalyTypeColor = (type: "magnitude" | "deaths" | "affected") => {
        switch (type) {
            case "magnitude":
                return "bg-blue-100 text-blue-700 border-blue-200"
            case "deaths":
                return "bg-red-100 text-red-700 border-red-200"
            case "affected":
                return "bg-orange-100 text-orange-700 border-orange-200"
        }
    }

    // Sorting
    let sortedAnomalies = [...anomalies]
    if (sortBy) {
        sortedAnomalies.sort((a, b) => {
            let aValue = a[sortBy]
            let bValue = b[sortBy]
            if (sortBy === "date" || sortBy === "lastUpdated") {
                aValue = new Date(aValue as string).getTime()
                bValue = new Date(bValue as string).getTime()
            }
            if (typeof aValue === "string" && typeof bValue === "string") {
                aValue = aValue.toLowerCase()
                bValue = bValue.toLowerCase()
            }
            if (aValue == null) return 1
            if (bValue == null) return -1
            if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
            if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
            return 0
        })
    }

    const handleSort = (column: keyof AnomalyEvent) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortBy(column)
            setSortDirection("asc")
        }
    }

    // Map API response fields to expected table fields
    const mappedAnomalies = sortedAnomalies.map((anomaly: any, idx: number) => {
        const magnitude = anomaly["Magnitude"] ?? null;
        const deaths = anomaly["Total Deaths"] ?? null;
        const affected = anomaly["Total Affected"] ?? null;
        let anomalyType = "";
        if (magnitude !== null && magnitude !== undefined) {
            anomalyType = "magnitude";
        } else if (deaths !== null && deaths !== undefined) {
            anomalyType = "deaths";
        } else if (affected !== null && affected !== undefined) {
            anomalyType = "affected";
        }
        return {
            id: anomaly.id || `${anomaly["Country"] || ""}-${anomaly["Event Name"] || anomaly["Disaster Type"] || idx}`,
            disasterType: anomaly["Disaster Type"] || "",
            country: anomaly["Country"] || "",
            eventName: anomaly["Event Name"] || "",
            date: anomaly["Start Year"] ? `${anomaly["Start Year"]}` : "",
            magnitude,
            deaths,
            affected,
            anomalyType: anomalyType as "magnitude" | "deaths" | "affected" | "",
            source: anomaly["source"] || "#",
            coordinates: anomaly["coordinates"] || [0, 0],
        };
    });

    return (
        <TabsContent value="anomalies">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Anomalous Disasters</CardTitle>
                            <CardDescription className="mt-1.5">
                                Events that significantly exceed normal thresholds for magnitude, deaths, or affected population
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            {showFilters ? (
                                <>
                                    Hide Filters
                                    <ChevronUp className="h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    Show Filters
                                    <ChevronDown className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Disaster Type</label>
                                <Select value={selectedDisasterType} onValueChange={setSelectedDisasterType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="earthquake">Earthquake</SelectItem>
                                        <SelectItem value="flood">Flood</SelectItem>
                                        <SelectItem value="storm">Storm</SelectItem>
                                        <SelectItem value="wildfire">Wildfire</SelectItem>
                                        <SelectItem value="volcanic activity">Volcanic Activity</SelectItem>
                                        <SelectItem value="tsunami">Tsunami</SelectItem>
                                        <SelectItem value="drought">Drought</SelectItem>
                                        <SelectItem value="landslide">Landslide</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Anomaly Type</label>
                                <Select value={selectedAnomalyType} onValueChange={setSelectedAnomalyType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select anomaly" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Anomalies</SelectItem>
                                        <SelectItem value="magnitude">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                Magnitude
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="deaths">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                                Deaths
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="affected">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-orange-500" />
                                                Affected
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Year Range</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Start Year"
                                        value={yearRange.start}
                                        onChange={handleYearChange('start')}
                                        className="w-full"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="End Year"
                                        value={yearRange.end}
                                        onChange={handleYearChange('end')}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex items-end">
                                <Button className="w-full">Apply Filters</Button>
                            </div>
                        </div>
                    )}

                    {/* Data Table */}
                    <div className="rounded-lg border border-gray-200 bg-white">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">Anomaly Results</h3>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        Magnitude
                                    </Badge>
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                        Deaths
                                    </Badge>
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                        Affected
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead onClick={() => handleSort("disasterType")} className="cursor-pointer select-none">
                                        Disaster Type
                                        {sortBy === "disasterType" && (sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort("country")} className="cursor-pointer select-none">
                                        Country
                                        {sortBy === "country" && (sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort("date")} className="cursor-pointer select-none">
                                        Date
                                        {sortBy === "date" && (sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort("magnitude")} className="cursor-pointer select-none text-right">
                                        Magnitude
                                        {sortBy === "magnitude" && (sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort("deaths")} className="cursor-pointer select-none text-right">
                                        Deaths
                                        {sortBy === "deaths" && (sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort("affected")} className="cursor-pointer select-none text-right">
                                        Affected
                                        {sortBy === "affected" && (sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort("anomalyType")} className="cursor-pointer select-none">
                                        Anomaly Type
                                        {sortBy === "anomalyType" && (sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mappedAnomalies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertTriangle className="h-8 w-8 text-gray-400" />
                                                <p>No anomalies found</p>
                                                <p className="text-sm">Try adjusting the filters to see more results</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    mappedAnomalies.map((anomaly) => (
                                        <TableRow key={anomaly.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium capitalize">
                                                {anomaly.disasterType}
                                            </TableCell>
                                            <TableCell>{anomaly.country}</TableCell>
                                            <TableCell>
                                                {anomaly.date || ""}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {anomaly.magnitude !== null && anomaly.magnitude !== undefined ? anomaly.magnitude.toFixed(2) : ""}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {anomaly.deaths !== null && anomaly.deaths !== undefined ? anomaly.deaths.toLocaleString() : ""}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {anomaly.affected !== null && anomaly.affected !== undefined ? anomaly.affected.toLocaleString() : ""}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`${getAnomalyTypeColor(anomaly.anomalyType as "magnitude" | "deaths" | "affected")}`}
                                                >
                                                    {anomaly.anomalyType}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {mappedAnomalies.length > 0 && (
                        <div className="flex items-center justify-between pt-4">
                            <div className="text-sm text-gray-500">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} results
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    disabled={currentPage * itemsPerPage >= pagination.total}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    )
} 