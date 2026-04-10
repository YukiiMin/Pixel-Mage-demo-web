'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import { useEffect, useState } from 'react'

// Types for VN Address API
interface VNWard {
  code: number
  name: string
}

interface VNDistrict {
  code: number
  name: string
  wards: VNWard[]
}

interface VNProvince {
  code: number
  name: string
  districts: VNDistrict[]
}

interface VNAddressSelectProps {
  value: string // full address string
  onChange: (address: string) => void
  disabled?: boolean
}

export function VNAddressSelect({ value, onChange, disabled }: VNAddressSelectProps) {
  const [provinces, setProvinces] = useState<VNProvince[]>([])
  const [loading, setLoading] = useState(false)
  const [provinceOpen, setProvinceOpen] = useState(false)

  // Selected values
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null)
  const [selectedWard, setSelectedWard] = useState<number | null>(null)
  const [streetAddress, setStreetAddress] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(true)
      try {
        const res = await fetch('https://provinces.open-api.vn/api/?depth=3')
        const data = await res.json()
        setProvinces(data)
      } catch (err) {
        console.error('Failed to fetch provinces:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProvinces()
  }, [])

  // Parse existing address when value prop is provided and provinces loaded
  useEffect(() => {
    if (!value || provinces.length === 0 || isInitialized) return

    const parts = value.split(',').map((p) => p.trim())
    if (parts.length >= 3) {
      const wardName = parts[parts.length - 3]
      const districtName = parts[parts.length - 2]
      const provinceName = parts[parts.length - 1]
      const street = parts.slice(0, parts.length - 3).join(', ')

      const province = provinces.find((p) => p.name === provinceName)
      if (province) {
        setSelectedProvince(province.code)
        const district = province.districts.find((d) => d.name === districtName)
        if (district) {
          setSelectedDistrict(district.code)
          const ward = district.wards.find((w) => w.name === wardName)
          if (ward) {
            setSelectedWard(ward.code)
          }
        }
      }
      setStreetAddress(street)
    } else {
      setStreetAddress(value)
    }
    setIsInitialized(true)
  }, [value, provinces, isInitialized])

  // Combine address parts
  const combineAddress = () => {
    const province = provinces.find((p) => p.code === selectedProvince)
    const district = province?.districts.find((d) => d.code === selectedDistrict)
    const ward = district?.wards.find((w) => w.code === selectedWard)

    const parts = []
    if (streetAddress.trim()) parts.push(streetAddress.trim())
    if (ward) parts.push(ward.name)
    if (district) parts.push(district.name)
    if (province) parts.push(province.name)

    return parts.join(', ')
  }

  // Handle province change
  const handleProvinceChange = (code: number) => {
    setSelectedProvince(code)
    setSelectedDistrict(null)
    setSelectedWard(null)
  }

  // Handle district change
  const handleDistrictChange = (code: number) => {
    setSelectedDistrict(code)
    setSelectedWard(null)
  }

  // Handle ward change
  const handleWardChange = (code: number) => {
    setSelectedWard(code)
  }

  // Handle street change
  const handleStreetChange = (val: string) => {
    setStreetAddress(val)
  }

  // Update parent when any part changes (user interaction)
  useEffect(() => {
    if (!isInitialized) return // Don't call onChange during initial parse

    const fullAddress = combineAddress()
    // Only call onChange if address actually changed
    if (fullAddress !== value) {
      onChange(fullAddress)
    }
  }, [selectedProvince, selectedDistrict, selectedWard, streetAddress])

  const selectedProvinceName = selectedProvince
    ? provinces.find((p) => p.code === selectedProvince)?.name
    : null

  const selectedDistrictName = selectedProvince && selectedDistrict
    ? provinces
        .find((p) => p.code === selectedProvince)
        ?.districts.find((d) => d.code === selectedDistrict)?.name
    : null

  const selectedWardName = selectedProvince && selectedDistrict && selectedWard
    ? provinces
        .find((p) => p.code === selectedProvince)
        ?.districts.find((d) => d.code === selectedDistrict)
        ?.wards.find((w) => w.code === selectedWard)?.name
    : null

  return (
    <div className="space-y-3">
      {/* Province - Searchable Combobox */}
      <Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={provinceOpen}
            className="w-full justify-between bg-card/60 hover:bg-card/80"
            disabled={disabled || loading}
          >
            {loading
              ? 'Đang tải...'
              : selectedProvinceName || 'Chọn Tỉnh/Thành'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command className="w-full">
            <CommandInput placeholder="Tìm kiếm tỉnh/thành..." className="h-9" />
            <CommandList className="max-h-[300px] overflow-y-auto">
              <CommandEmpty>Không tìm thấy tỉnh/thành.</CommandEmpty>
              <CommandGroup>
                {provinces.map((province) => (
                  <CommandItem
                    key={province.code}
                    value={province.name}
                    onSelect={() => {
                      handleProvinceChange(province.code)
                      setProvinceOpen(false)
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedProvince === province.code ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {province.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* District Dropdown */}
      <Select
        value={selectedDistrict?.toString() || ''}
        onValueChange={(val) => handleDistrictChange(parseInt(val))}
        disabled={!selectedProvince || disabled}
      >
        <SelectTrigger className="bg-card/60">
          <SelectValue
            placeholder={selectedProvince ? 'Chọn Quận/Huyện' : 'Chọn Tỉnh/Thành trước'}
          />
        </SelectTrigger>
        <SelectContent>
          {selectedProvince &&
            provinces
              .find((p) => p.code === selectedProvince)
              ?.districts.map((district) => (
                <SelectItem key={district.code} value={district.code.toString()}>
                  {district.name}
                </SelectItem>
              ))}
        </SelectContent>
      </Select>

      {/* Ward Dropdown */}
      <Select
        value={selectedWard?.toString() || ''}
        onValueChange={(val) => handleWardChange(parseInt(val))}
        disabled={!selectedDistrict || disabled}
      >
        <SelectTrigger className="bg-card/60">
          <SelectValue
            placeholder={selectedDistrict ? 'Chọn Phường/Xã' : 'Chọn Quận/Huyện trước'}
          />
        </SelectTrigger>
        <SelectContent>
          {selectedProvince &&
            selectedDistrict &&
            provinces
              .find((p) => p.code === selectedProvince)
              ?.districts.find((d) => d.code === selectedDistrict)
              ?.wards.map((ward) => (
                <SelectItem key={ward.code} value={ward.code.toString()}>
                  {ward.name}
                </SelectItem>
              ))}
        </SelectContent>
      </Select>

      {/* Street Address */}
      <Input
        value={streetAddress}
        onChange={(e) => handleStreetChange(e.target.value)}
        placeholder="Số nhà, tên đường..."
        className="bg-card/60"
        disabled={disabled}
      />

      {/* Preview */}
      <p className="text-xs text-muted-foreground">
        Địa chỉ đầy đủ: {combineAddress() || 'Chưa nhập'}
      </p>
    </div>
  )
}
