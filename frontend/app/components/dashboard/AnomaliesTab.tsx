"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle, Filter, ChevronDown, ChevronUp, X, Check } from "lucide-react"
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
    const [selectedCountry, setSelectedCountry] = useState<string>("")
    const [selectedDisasterType, setSelectedDisasterType] = useState<string>("")
    const [yearRange, setYearRange] = useState<{ start: string }>({
        start: "",
    })
    const [selectedAnomalyType, setSelectedAnomalyType] = useState<string>("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [showFilters, setShowFilters] = useState(true)
    const itemsPerPage = 10
    const [anomalies, setAnomalies] = useState<any[]>([])
    const [pagination, setPagination] = useState<{ page: number; page_size: number; total: number; total_pages: number }>({ page: 1, page_size: 10, total: 0, total_pages: 0 })
    const [appliedFilters, setAppliedFilters] = useState({
        country: "",
        disasterType: "",
        year: "",
        anomalyType: "all"
    })

    useEffect(() => {
        const fetchAnomalies = async () => {
            const queryParams = new URLSearchParams()
            if (appliedFilters.country) queryParams.append("country", appliedFilters.country)
            if (appliedFilters.disasterType && appliedFilters.disasterType !== "all") {
                queryParams.append("disaster_type", appliedFilters.disasterType)
            }
            if (appliedFilters.year) queryParams.append("start_year", appliedFilters.year)
            if (appliedFilters.anomalyType && appliedFilters.anomalyType !== "all") {
                queryParams.append("anomaly_type", appliedFilters.anomalyType)
            }
            if (pagination.page) queryParams.append("page", pagination.page.toString())
            if (pagination.page_size) queryParams.append("page_size", pagination.page_size.toString())

            const response = await fetch(`http://localhost:5001/anomalies?${queryParams}`)
            const data = await response.json()
            setAnomalies(data.results || [])
            setPagination(data.pagination || { page: 1, page_size: 10, total: 0, total_pages: 0 })
        }

        fetchAnomalies()
    }, [appliedFilters, pagination.page, pagination.page_size])

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
    const mappedAnomalies = anomalies.map((anomaly: any, idx: number) => {
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
            id: anomaly.id || `${anomaly["Country"] || ""}-${anomaly["Event Name"] || anomaly["Disaster Type"] || ""}-${idx}`,
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

    const handleApplyFilters = () => {
        setAppliedFilters({
            country: selectedCountry,
            disasterType: selectedDisasterType,
            year: yearRange.start,
            anomalyType: selectedAnomalyType
        })
    }

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
                    <div className="mb-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4 p-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-5 w-5 text-gray-500" />
                                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showFilters ? (
                                        <ChevronUp className="h-5 w-5" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {showFilters && (
                                <div className="space-y-6 p-4">
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="w-full">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                            <Input
                                                type="text"
                                                placeholder="Filter by country"
                                                value={selectedCountry}
                                                onChange={(e) => setSelectedCountry(e.target.value)}
                                                className="w-full focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="w-full">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Disaster Type</label>
                                            <Select value={selectedDisasterType} onValueChange={setSelectedDisasterType}>
                                                <SelectTrigger className="w-full">
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
                                        <div className="w-full">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Year</label>
                                            <Input
                                                type="number"
                                                placeholder="Filter by year"
                                                value={yearRange.start}
                                                onChange={(e) => setYearRange({ ...yearRange, start: e.target.value })}
                                                className="w-full focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="w-full">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Anomaly Type</label>
                                            <Select value={selectedAnomalyType} onValueChange={setSelectedAnomalyType}>
                                                <SelectTrigger className="w-full">
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
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedCountry("")
                                                setSelectedDisasterType("")
                                                setSelectedAnomalyType("all")
                                                setYearRange({ start: "" })
                                                setAppliedFilters({
                                                    country: "",
                                                    disasterType: "",
                                                    year: "",
                                                    anomalyType: "all"
                                                })
                                            }}
                                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Clear Filters
                                        </Button>
                                        <Button
                                            onClick={handleApplyFilters}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-2 px-4 py-2 rounded-md shadow-sm"
                                        >
                                            <Check className="h-4 w-4" />
                                            Apply Filters
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

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
                                    <TableHead className="px-4 py-2 text-left">Disaster Type</TableHead>
                                    <TableHead className="px-4 py-2 text-left">Country</TableHead>
                                    <TableHead className="px-4 py-2 text-left">Event Name</TableHead>
                                    <TableHead className="px-4 py-2 text-left">Date</TableHead>
                                    <TableHead className="px-4 py-2 text-left">Magnitude</TableHead>
                                    <TableHead className="px-4 py-2 text-left">Deaths</TableHead>
                                    <TableHead className="px-4 py-2 text-left">Affected</TableHead>
                                    <TableHead className="px-4 py-2 text-left">Anomaly Type</TableHead>
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
                                                {anomaly.eventName}
                                            </TableCell>
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