export function courseMapper(courseData: any[]): any[] {
    return courseData.map((res: any) => {
        return {
            classId: res.class_id,
            className: res.class_name[0].toUpperCase() + res.class_name.slice(1),
            firstName: res.first_name,
            lastName: res.last_name,
            inviteCode: res.invite_code,
            roleName: res.role_name[0].toUpperCase() + res.role_name.slice(1),
            originalObject: res
        }
    })
}