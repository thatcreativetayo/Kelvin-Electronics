import { useCallback, useEffect, useRef, useState } from "react";
import { set, unset, type StringInputProps } from "sanity";
import { Box, Button, Card, Flex, Label, Stack, Text, TextInput } from "@sanity/ui";

type UploadConfig = {
  endpoint: string;
  token: string;
};

const STORAGE_KEY = "kelvin.cloudinary.upload";
const DEFAULT_CONFIG: UploadConfig = {
  endpoint: "http://localhost:3000/api/cloudinary/sign",
  token: "",
};

type SignResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

const cloudNameFromEnv = process.env.SANITY_STUDIO_CLOUDINARY_CLOUD_NAME;

/**
 * Signed Cloudinary upload.
 *
 * The API secret stays on the storefront server. The Studio asks
 * /api/cloudinary/sign for a short-lived signature using an operator token,
 * then uploads the file directly to Cloudinary. Public IDs (not Sanity
 * assets) are stored on the document so the storefront can deliver variants
 * through f_auto/q_auto.
 */
export function CloudinaryImageInput(props: StringInputProps) {
  const { value, onChange, elementProps } = props;
  const [config, setConfig] = useState<UploadConfig>(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cloudName, setCloudName] = useState(cloudNameFromEnv ?? "");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setConfig({ ...DEFAULT_CONFIG, ...(JSON.parse(stored) as Partial<UploadConfig>) });
    } catch {
      /* a blocked localStorage should not stop editing */
    }
  }, []);

  const saveConfig = useCallback((next: UploadConfig) => {
    setConfig(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.type.startsWith("image/")) {
        setError("Only image files can be uploaded.");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError("Images must be under 20 MB.");
        return;
      }
      if (!config.token) {
        setShowConfig(true);
        setError("Add the upload token from the storefront environment before uploading.");
        return;
      }

      setUploading(true);
      try {
        const signResponse = await fetch(config.endpoint, {
          method: "POST",
          headers: { "x-upload-token": config.token },
        });
        const sign = (await signResponse.json()) as SignResponse & { message?: string };
        if (!signResponse.ok) {
          throw new Error(sign.message ?? "The signing endpoint refused the upload.");
        }
        setCloudName(sign.cloudName);

        const body = new FormData();
        body.append("file", file);
        body.append("api_key", sign.apiKey);
        body.append("timestamp", String(sign.timestamp));
        body.append("signature", sign.signature);
        body.append("folder", sign.folder);

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
          { method: "POST", body },
        );
        const asset = (await uploadResponse.json()) as {
          public_id?: string;
          error?: { message?: string };
        };
        if (!uploadResponse.ok || !asset.public_id) {
          throw new Error(asset.error?.message ?? "Cloudinary rejected the file.");
        }
        onChange(set(asset.public_id));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "The upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [config, onChange],
  );

  const preview =
    value && cloudName
      ? `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_640/${value}`
      : null;

  return (
    <Stack space={3}>
      {value ? (
        <Card border radius={2} padding={2} tone="transparent">
          <Stack space={3}>
            {preview ? (
              <img
                src={preview}
                alt=""
                style={{ width: "100%", maxHeight: 220, objectFit: "contain", display: "block" }}
              />
            ) : (
              <Text size={1} muted>
                Set SANITY_STUDIO_CLOUDINARY_CLOUD_NAME to preview this asset inside the Studio.
              </Text>
            )}
            <Flex align="center" gap={2} justify="space-between" wrap="wrap">
              <Text size={1} muted style={{ wordBreak: "break-all" }}>
                {value}
              </Text>
              <Flex gap={2}>
                <Button text="Replace" mode="ghost" onClick={() => fileRef.current?.click()} />
                <Button text="Remove" mode="ghost" tone="critical" onClick={() => onChange(unset())} />
              </Flex>
            </Flex>
          </Stack>
        </Card>
      ) : (
        <Card
          border
          radius={2}
          padding={4}
          tone={dragging ? "primary" : "transparent"}
          onDragOver={(event: React.DragEvent) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event: React.DragEvent) => {
            event.preventDefault();
            setDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) void upload(file);
          }}
        >
          <Stack space={3}>
            <Text size={1} muted>
              Drop a product photograph here, or choose a file. Images are uploaded to Cloudinary and delivered
              with automatic format and quality.
            </Text>
            <Flex gap={2}>
              <Button
                text={uploading ? "Uploading…" : "Choose image"}
                tone="primary"
                loading={uploading}
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              />
            </Flex>
          </Stack>
        </Card>
      )}

      <input
        ref={fileRef}
        id={elementProps.id}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = "";
        }}
      />

      {error && (
        <Card padding={3} radius={2} tone="critical" border>
          <Text size={1}>{error}</Text>
        </Card>
      )}

      <Box>
        <Button
          text={showConfig ? "Hide upload settings" : "Upload settings"}
          mode="bleed"
          fontSize={1}
          padding={2}
          onClick={() => setShowConfig((open) => !open)}
        />
      </Box>

      {showConfig && (
        <Card border radius={2} padding={3} tone="transparent">
          <Stack space={3}>
            <Stack space={2}>
              <Label size={1}>Storefront signing endpoint</Label>
              <TextInput
                id="cloudinary-endpoint"
                aria-label="Storefront signing endpoint"
                value={config.endpoint}
                onChange={(event) => saveConfig({ ...config, endpoint: event.currentTarget.value })}
                placeholder="https://kelvin.store/api/cloudinary/sign"
              />
            </Stack>
            <Stack space={2}>
              <Label size={1}>Upload token</Label>
              <TextInput
                id="cloudinary-token"
                aria-label="Upload token"
                type="password"
                value={config.token}
                onChange={(event) => saveConfig({ ...config, token: event.currentTarget.value })}
                placeholder="CLOUDINARY_UPLOAD_TOKEN"
              />
              <Text size={0} muted>
                Stored in this browser only. The token authorises uploads but cannot delete or administer
                assets. For production, verify the editor's Sanity session in a serverless function instead.
              </Text>
            </Stack>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
