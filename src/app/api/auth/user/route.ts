// ab ham is route pe user ka data return karenge fir usko font end may state management se centrlised way pe store kar denge
// like app k throughout ye access ho sakey
// ham bade project k liye redux use kar sakte hai per is chote project k liye bus context api use karenge

import authOptions from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/model/user.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // first db connect karenge
        // fir session se user ka data lenge
        await connectDB();

        const session = await getServerSession(authOptions);
        console.log(session);

        // check karenge ki session hai ya nahi hai
        // agar session nahi hai toh error send kar denge
        if (!session || !session.user.email) {
            return NextResponse.json(
                {
                    message: "user does not have session",
                },
                { status: 400 },
            );
        }

        // session k user id se user ko find karenge and uss may se password hatadenge
        // due to some reason mongo id save nahi ho rha jab google se sign in kar rhe hai
        // so ham find by email karenge
        // const user = await User.findById(session.user.id).select("-password");

        const user = await User.findOne({ email: session.user.email }).select("-password");

        // agar user nahi mila toh response as not found retrun kardenge
        if (!user) {
            return NextResponse.json(
                {
                    message: "user does not exist",
                },
                { status: 400 },
            );
        }

        // fir agar user mil gya toh use respnse ma send kardenge
        // user ek object hai isliye hamne usko {user}, {status: 200} k bajaye user, {status: 200} likha hai
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: `error in user route ${error}` }, { status: 500 });
    }
}
