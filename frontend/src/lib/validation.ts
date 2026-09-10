import { safeParseAsync } from "valibot";

export const validateData = async <T>({
  formData,
  valibotSchema,
}: {
  formData: FormData;
  valibotSchema: any;
}): Promise<
  { success: false; errors: string[] } | { success: true; object: T }
> => {
  
  const result = await safeParseAsync(valibotSchema, Object.fromEntries(formData.entries()));
  if (result.success) {
    return {
      success: true,
      object: result.output as T
    };

  } else {
    // console.log(result);
    return {
      success: false,
      errors: result.issues.map(issue => {
        return issue.message
      }),
    };
  }
};
