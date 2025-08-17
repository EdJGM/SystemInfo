"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface Thresholds {
  cpu: number | null
  memory: number | null
  disk: number | null
  network: number | null
}

interface MonitoringConfigProps {
  onSave: (thresholds: Thresholds, updateInterval: number, isEnabled: boolean) => void
  initialConfig: Thresholds
  initialInterval: number
  initialEnabled: boolean
}

export default function MonitoringConfig({
  onSave,
  initialConfig,
  initialInterval,
  initialEnabled,
}: MonitoringConfigProps) {
  const [thresholds, setThresholds] = useState<Thresholds>(initialConfig)
  const [updateInterval, setUpdateInterval] = useState(initialInterval)
  const [isEnabled, setIsEnabled] = useState(initialEnabled)

  const handleThresholdChange = (resource: keyof Thresholds, value: string) => {
    setThresholds((prev) => ({
      ...prev,
      [resource]: value === "" ? null : Number.parseFloat(value),
    }))
  }

  const handleSave = () => {
    onSave(thresholds, updateInterval, isEnabled)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow text-black">
      <h2 className="text-xl font-bold mb-4">Configuración de Monitoreo</h2>
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="monitoringEnabled"
          checked={isEnabled}
          onCheckedChange={(checked) => setIsEnabled(checked as boolean)}
        />
        <Label htmlFor="monitoringEnabled">Habilitar monitoreo</Label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
        {(Object.keys(thresholds) as Array<keyof Thresholds>).map((resource) => (
          <div key={resource} className="flex flex-col space-y-2">
            <Label htmlFor={`${resource}Threshold`}>
              Umbral de {resource.charAt(0).toUpperCase() + resource.slice(1)} (%)
            </Label>
            <Input
              id={`${resource}Threshold`}
              type="number"
              value={thresholds[resource] === null ? "" : thresholds[resource]}
              onChange={(e) => handleThresholdChange(resource, e.target.value)}
              disabled={!isEnabled}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Label htmlFor="updateInterval">Intervalo de actualización (ms)</Label>
        <Input
          id="updateInterval"
          type="number"
          value={updateInterval}
          onChange={(e) => setUpdateInterval(Number(e.target.value))}
          disabled={!isEnabled}
          min="1000"
          step="1000"
        />
      </div>
      <Button className="mt-4" onClick={handleSave} disabled={!isEnabled}>
        Guardar Configuración
      </Button>
    </div>
  )
}

