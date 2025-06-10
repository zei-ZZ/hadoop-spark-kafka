"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar, Clock, MapPin, ChevronUp, ChevronDown, Filter, X, Check } from "lucide-react"

interface CorrelatedEvent {
    Country: string
    DisasterType_A: string
    StartDate_A: string
    EventName_A: string
    DisasterType_B: string
    StartDate_B: string
    EventName_B: string
    Days_Between: number
}

export function CorrelationsTab() {
    const [data, setData] = useState<CorrelatedEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const itemsPerPage = 8
    const [showFilters, setShowFilters] = useState(true)
    const [selectedCountry, setSelectedCountry] = useState("all")
    const [selectedDisasterType, setSelectedDisasterType] = useState("all")
    const [selectedDaysBetween, setSelectedDaysBetween] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [appliedFilters, setAppliedFilters] = useState({
        country: "all",
        disasterType: "all",
        daysBetween: "all",
        search: ""
    })

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const queryParams = new URLSearchParams({
                    page: currentPage.toString(),
                    page_size: itemsPerPage.toString()
                })

                // Add filters from appliedFilters state
                if (appliedFilters.country !== "all") queryParams.append("country", appliedFilters.country)
                if (appliedFilters.disasterType !== "all") {
                    queryParams.append("disaster_type_a", appliedFilters.disasterType)
                }
                if (appliedFilters.daysBetween !== "all") queryParams.append("days_between", appliedFilters.daysBetween)
                if (appliedFilters.search) {
                    queryParams.append("event_name_a", appliedFilters.search)
                    queryParams.append("event_name_b", appliedFilters.search)
                }

                const response = await fetch(`http://localhost:5001/correlations?${queryParams}`)
                if (!response.ok) throw new Error('Failed to fetch data')

                const result = await response.json()
                setData(result.results)
                setTotalItems(result.pagination.total)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [currentPage, itemsPerPage, appliedFilters])

    // Get unique countries and disaster types for filters
    const countries = Array.from(new Set(data.map(c => c.Country)))
    const disasterTypes = Array.from(new Set([
        ...data.map(c => c.DisasterType_A),
        ...data.map(c => c.DisasterType_B)
    ]))

    const getDisasterTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case "earthquake":
                return "bg-blue-100 text-blue-700 border-blue-200"
            case "tsunami":
                return "bg-cyan-100 text-cyan-700 border-cyan-200"
            case "typhoon":
            case "hurricane":
            case "cyclone":
                return "bg-purple-100 text-purple-700 border-purple-200"
            case "flood":
                return "bg-indigo-100 text-indigo-700 border-indigo-200"
            case "wildfire":
                return "bg-orange-100 text-orange-700 border-orange-200"
            case "drought":
                return "bg-yellow-100 text-yellow-700 border-yellow-200"
            case "volcanic activity":
                return "bg-red-100 text-red-700 border-red-200"
            case "landslide":
                return "bg-brown-100 text-brown-700 border-brown-200"
            default:
                return "bg-gray-100 text-gray-700 border-gray-200"
        }
    }

    const handleApplyFilters = () => {
        setAppliedFilters({
            country: selectedCountry,
            disasterType: selectedDisasterType,
            daysBetween: selectedDaysBetween,
            search: searchQuery
        })
        setCurrentPage(1) // Reset to first page when applying new filters
    }

    const handleClearFilters = () => {
        setSelectedCountry("all")
        setSelectedDisasterType("all")
        setSelectedDaysBetween("all")
        setSearchQuery("")
        setAppliedFilters({
            country: "all",
            disasterType: "all",
            daysBetween: "all",
            search: ""
        })
        setCurrentPage(1)
    }

    return (
        <TabsContent value="correlations">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Temporally Correlated Disasters</CardTitle>
                            <CardDescription className="mt-1.5">
                                Pairs of different disaster types that occurred within 7 days of each other in the same country
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
                                    <div className="grid grid-cols-4 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Country</label>
                                            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                                                <SelectTrigger className="w-full h-10">
                                                    <SelectValue placeholder="Select country" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Countries</SelectItem>
                                                    {countries.map(country => (
                                                        <SelectItem key={country} value={country}>{country}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Disaster Type</label>
                                            <Select value={selectedDisasterType} onValueChange={setSelectedDisasterType}>
                                                <SelectTrigger className="w-full h-10">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Types</SelectItem>
                                                    {disasterTypes.map(type => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Days Between</label>
                                            <Select value={selectedDaysBetween} onValueChange={setSelectedDaysBetween}>
                                                <SelectTrigger className="w-full h-10">
                                                    <SelectValue placeholder="Select days" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Intervals</SelectItem>
                                                    {[0, 1, 2, 3, 4, 5, 6, 7].map(days => (
                                                        <SelectItem key={days} value={days.toString()}>
                                                            {days === 0 ? "Same day" : `${days} day${days === 1 ? "" : "s"}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Search</label>
                                            <Input
                                                type="text"
                                                placeholder="Search events..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full h-10 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100">
                                        <Button
                                            variant="outline"
                                            onClick={handleClearFilters}
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
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead>Country</TableHead>
                                    <TableHead>First Disaster</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Days Between</TableHead>
                                    <TableHead>Second Disaster</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                                <p>Loading correlations...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-red-500 py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertTriangle className="h-8 w-8" />
                                                <p>Error loading data</p>
                                                <p className="text-sm">{error}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertTriangle className="h-8 w-8 text-gray-400" />
                                                <p>No correlations found</p>
                                                <p className="text-sm">Try adjusting the filters to see more results</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((correlation, index) => (
                                        <TableRow key={index} className="hover:bg-gray-50">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span className="font-medium">{correlation.Country}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <Badge
                                                        variant="outline"
                                                        className={getDisasterTypeColor(correlation.DisasterType_A)}
                                                    >
                                                        {correlation.DisasterType_A}
                                                    </Badge>
                                                    <div className="text-sm">{correlation.EventName_A}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(correlation.StartDate_A).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-gray-100 text-gray-700 border-gray-200"
                                                    >
                                                        {correlation.Days_Between === 0 ? (
                                                            "Same day"
                                                        ) : (
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {correlation.Days_Between} day{correlation.Days_Between === 1 ? "" : "s"}
                                                            </div>
                                                        )}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <Badge
                                                        variant="outline"
                                                        className={getDisasterTypeColor(correlation.DisasterType_B)}
                                                    >
                                                        {correlation.DisasterType_B}
                                                    </Badge>
                                                    <div className="text-sm">{correlation.EventName_B}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(correlation.StartDate_B).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {totalItems > itemsPerPage && (
                        <div className="flex items-center justify-between pt-4">
                            <div className="text-sm text-gray-500">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
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
                                    disabled={currentPage * itemsPerPage >= totalItems}
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