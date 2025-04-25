"use client"

import type { TDistrict, TUpazila, TDivision } from "@/types/global"
import { type ChangeEvent, useEffect, useState } from "react"

interface AddressSelectionProps {
  onUpazilaChange?: (upazilaId: string) => void
  defaultUpazilaId?: string
}

const AddressSelection = ({ onUpazilaChange, defaultUpazilaId }: AddressSelectionProps) => {
  const [selectedDivision, setSelectedDivision] = useState<TDivision | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<TDistrict | null>(null)
  const [selectedUpazila, setSelectedUpazila] = useState<TUpazila | null>(null)
  const [divisions, setDivisions] = useState<TDivision[]>([])
  const [districts, setDistricts] = useState<TDistrict[]>([])
  const [upazilas, setUpazilas] = useState<TUpazila[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Load cached data and last selections from localStorage on component mount
  useEffect(() => {
    // Try to load cached data first
    const cachedDivisions = localStorage.getItem("cachedDivisions")
    const cachedDistricts = localStorage.getItem("cachedDistricts")
    const cachedUpazilas = localStorage.getItem("cachedUpazilas")

    // Load saved selections
    const lastDivisionId = localStorage.getItem("lastSelectedDivisionId")
    const lastDistrictId = localStorage.getItem("lastSelectedDistrictId")
    const lastUpazilaId = defaultUpazilaId || localStorage.getItem("lastSelectedUpazilaId")

    // Set cached data if available
    if (cachedDivisions) {
      try {
        const parsedDivisions = JSON.parse(cachedDivisions) as TDivision[]
        setDivisions(parsedDivisions)
        
        // Find and set the last selected division
        if (lastDivisionId) {
          const division = parsedDivisions.find(d => d.id === lastDivisionId)
          if (division) {
            setSelectedDivision(division)
          }
        }
      } catch (error) {
        console.error("Error parsing cached divisions:", error)
      }
    }

    if (cachedDistricts) {
      try {
        const parsedDistricts = JSON.parse(cachedDistricts) as TDistrict[]
        
        // If we have a selected division, filter districts
        if (lastDivisionId) {
          const filteredDistricts = parsedDistricts.filter(d => d.division_id === lastDivisionId)
          setDistricts(filteredDistricts)
          
          // Find and set the last selected district
          if (lastDistrictId) {
            const district = filteredDistricts.find(d => d.id === lastDistrictId)
            if (district) {
              setSelectedDistrict(district)
            }
          }
        } else {
          setDistricts(parsedDistricts)
        }
      } catch (error) {
        console.error("Error parsing cached districts:", error)
      }
    }

    if (cachedUpazilas) {
      try {
        const parsedUpazilas = JSON.parse(cachedUpazilas) as TUpazila[]
        
        // If we have a selected district, filter upazilas
        if (lastDistrictId) {
          const filteredUpazilas = parsedUpazilas.filter(u => u.district_id === lastDistrictId)
          setUpazilas(filteredUpazilas)
          
          // Find and set the last selected upazila
          if (lastUpazilaId) {
            const upazila = filteredUpazilas.find(u => u.id === lastUpazilaId)
            if (upazila) {
              setSelectedUpazila(upazila)
              // Notify parent component about the selected upazila
              if (onUpazilaChange) {
                onUpazilaChange(upazila.id)
              }
            }
          }
        } else {
          setUpazilas(parsedUpazilas)
        }
      } catch (error) {
        console.error("Error parsing cached upazilas:", error)
      }
    }

    // If no cached data, fetch from API
    if (!cachedDivisions) {
      fetchDivisions()
    }

    // If we have division but no districts, fetch districts
    if (lastDivisionId && !cachedDistricts) {
      fetchDistricts(lastDivisionId)
    }

    // If we have district but no upazilas, fetch upazilas
    if (lastDistrictId && !cachedUpazilas) {
      fetchUpazilas(lastDistrictId)
    }
  }, [defaultUpazilaId, onUpazilaChange])

  // Fetch divisions from API and cache them
  const fetchDivisions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/divisions.json")
      const data: TDivision[] = await response.json()
      setDivisions(data)
      
      // Cache the divisions data
      localStorage.setItem("cachedDivisions", JSON.stringify(data))
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching divisions data:", error)
      setIsLoading(false)
    }
  }

  // Fetch districts from API and cache them
  const fetchDistricts = async (divisionId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/districts.json")
      const data: TDistrict[] = await response.json()
      
      // Cache all districts
      localStorage.setItem("cachedDistricts", JSON.stringify(data))
      
      // Filter districts by division
      const filteredDistricts = data.filter(d => d.division_id === divisionId)
      setDistricts(filteredDistricts)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching districts data:", error)
      setIsLoading(false)
    }
  }

  // Fetch upazilas from API and cache them
  const fetchUpazilas = async (districtId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/upazilas.json")
      const data: TUpazila[] = await response.json()
      
      // Cache all upazilas
      localStorage.setItem("cachedUpazilas", JSON.stringify(data))
      
      // Filter upazilas by district
      const filteredUpazilas = data.filter(u => u.district_id === districtId)
      setUpazilas(filteredUpazilas)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching upazilas data:", error)
      setIsLoading(false)
    }
  }

  // Handle division selection change
  const handleDivisionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const divisionId = event.target.value
    const division = divisions.find(d => d.id === divisionId)
    
    setSelectedDivision(division || null)
    setSelectedDistrict(null)
    setSelectedUpazila(null)
    
    // Save selected division to localStorage
    if (division) {
      localStorage.setItem("lastSelectedDivisionId", division.id)
      
      // Get districts for this division
      const cachedDistricts = localStorage.getItem("cachedDistricts")
      if (cachedDistricts) {
        try {
          const parsedDistricts = JSON.parse(cachedDistricts) as TDistrict[]
          const filteredDistricts = parsedDistricts.filter(d => d.division_id === division.id)
          setDistricts(filteredDistricts)
        } catch (error) {
          console.error("Error parsing cached districts:", error)
          fetchDistricts(division.id)
        }
      } else {
        fetchDistricts(division.id)
      }
    } else {
      localStorage.removeItem("lastSelectedDivisionId")
      localStorage.removeItem("lastSelectedDistrictId")
      localStorage.removeItem("lastSelectedUpazilaId")
      setDistricts([])
      setUpazilas([])
    }
    
    // Clear the selected upazila ID in parent component
    if (onUpazilaChange) {
      onUpazilaChange("")
    }
  }

  // Handle district selection change
  const handleDistrictChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const districtId = event.target.value
    const district = districts.find(d => d.id === districtId)
    
    setSelectedDistrict(district || null)
    setSelectedUpazila(null)
    
    // Save selected district to localStorage
    if (district) {
      localStorage.setItem("lastSelectedDistrictId", district.id)
      
      // Get upazilas for this district
      const cachedUpazilas = localStorage.getItem("cachedUpazilas")
      if (cachedUpazilas) {
        try {
          const parsedUpazilas = JSON.parse(cachedUpazilas) as TUpazila[]
          const filteredUpazilas = parsedUpazilas.filter(u => u.district_id === district.id)
          setUpazilas(filteredUpazilas)
        } catch (error) {
          console.error("Error parsing cached upazilas:", error)
          fetchUpazilas(district.id)
        }
      } else {
        fetchUpazilas(district.id)
      }
    } else {
      localStorage.removeItem("lastSelectedDistrictId")
      localStorage.removeItem("lastSelectedUpazilaId")
      setUpazilas([])
    }
    
    // Clear the selected upazila ID in parent component
    if (onUpazilaChange) {
      onUpazilaChange("")
    }
  }

  // Handle upazila selection change
  const handleUpazilaChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const upazilaId = event.target.value
    const upazila = upazilas.find(u => u.id === upazilaId)
    
    setSelectedUpazila(upazila || null)
    
    // Save selected upazila to localStorage
    if (upazila) {
      localStorage.setItem("lastSelectedUpazilaId", upazila.id)
      
      // Notify parent component about the selected upazila
      if (onUpazilaChange) {
        onUpazilaChange(upazila.id)
      }
    } else {
      localStorage.removeItem("lastSelectedUpazilaId")
      
      // Clear the selected upazila ID in parent component
      if (onUpazilaChange) {
        onUpazilaChange("")
      }
    }
  }

  return (
    <div className="row">
      <div className="my-1 col-md-4">
        <label htmlFor="division">বিভাগ নির্বাচন করুন</label>
        <select
          id="division"
          className="searchFrom form-control"
          value={selectedDivision?.id || ""}
          onChange={handleDivisionChange}
          disabled={isLoading}
        >
          <option value="">বিভাগ নির্বাচন করুন</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.bn_name}
            </option>
          ))}
        </select>
      </div>

      <div className="my-1 col-md-4">
        <label htmlFor="district">জেলা নির্বাচন করুন</label>
        <select
          id="district"
          className="searchFrom form-control"
          value={selectedDistrict?.id || ""}
          onChange={handleDistrictChange}
          disabled={!selectedDivision || isLoading}
        >
          <option value="">জেলা নির্বাচন করুন</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.bn_name}
            </option>
          ))}
        </select>
      </div>

      <div className="my-1 col-md-4">
        <label htmlFor="upazila">উপজেলা নির্বাচন করুন</label>
        <select
          id="upazila"
          className="searchFrom form-control"
          value={selectedUpazila?.id || ""}
          onChange={handleUpazilaChange}
          disabled={!selectedDistrict || isLoading}
        >
          <option value="">উপজেলা নির্বাচন করুন</option>
          {upazilas.map((u) => (
            <option key={u.id} value={u.id}>
              {u.bn_name}
            </option>
          ))}
        </select>
      </div>
      
      {isLoading && (
        <div className="col-12 mt-2">
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddressSelection
